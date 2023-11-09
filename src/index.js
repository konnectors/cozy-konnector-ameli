process.env.SENTRY_DSN =
  process.env.SENTRY_DSN ||
  'https://2b083a1ab2024d47ae73c0f390cafe5f@errors.cozycloud.cc/44'

const {
  log,
  BaseKonnector,
  requestFactory,
  errors,
  scrape
} = require('cozy-konnector-libs')
const moment = require('moment')
const sortBy = require('lodash/sortBy')
moment.locale('fr')
const bluebird = require('bluebird')
const crypto = require('crypto')
const Bill = require('./bill')

const urlService = require('./urlService')

const cheerio = require('cheerio')
let request = requestFactory()
const j = request.jar()
request = requestFactory({
  // debug: true,
  cheerio: true,
  json: false,
  jar: j,
  userAgent: false
})
const requestNoCheerio = requestFactory({
  // debug: true,
  cheerio: false,
  json: true,
  jar: j,
  userAgent: false
})

module.exports = new BaseKonnector(start)

async function start(fields) {
  await checkLogin(fields)
  await logIn.bind(this)(fields)
  const reqNoCheerio = await fetchMainPage()

  const attestationUrl = await fetchAttestation()

  if (attestationUrl) {
    await this.saveFiles(
      [
        {
          fileurl: attestationUrl,
          filename: 'Attestation_de_droits_ameli.pdf',
          shouldReplaceFile: () => true,
          requestOptions: {
            jar: j,
            gzip: true
          },
          fileAttributes: {
            metadata: {
              carbonCopy: true
            }
          }
        }
      ],
      fields,
      {
        requestInstance: requestNoCheerio,
        contentType: true,
        fileIdAttributes: ['filename']
      }
    )
  }

  const messages = await fetchMessages()
  await this.saveFiles(messages, fields, {
    requestInstance: requestNoCheerio,
    contentType: true,
    fileIdAttributes: ['vendorRef']
  })

  const reimbursements = await parseMainPage(reqNoCheerio)
  const entries = await getHealthCareBills(reimbursements, fields.login)
  if (entries.length) {
    await this.saveBills(entries, fields, {
      sourceAccount: this.accountId,
      sourceAccountIdentifier: fields.login,
      fileIdAttributes: ['vendorRef'],
      shouldUpdate: (entry, dbEntry) => {
        const result = entry.vendorRef && !dbEntry.vendorRef
        return result
      },
      requestInstance: requestNoCheerio,
      keys: ['vendorRef', 'date', 'amount', 'beneficiary', 'subtype', 'index'],
      linkBankOperations: false
    })
  }

  const IndemniteBills = getIndemniteBills(reimbursements, fields.login)
  if (IndemniteBills.length) {
    await this.saveBills(IndemniteBills, fields, {
      sourceAccount: this.accountId,
      sourceAccountIdentifier: fields.login,
      requestInstance: requestNoCheerio,
      fileIdAttributes: ['vendorRef'],
      keys: ['vendorRef', 'date', 'amount', 'subtype'],
      linkBankOperations: false
    })
  }

  const ident = await fetchIdentity()
  await this.saveIdentity(ident, fields.login)
}

async function fetchAttestation() {
  const $ = await request.post(urlService.getAttestationUrl(), {
    form: {
      attDroitsAccueilidBeneficiaire: 'FAMILLE',
      attDroitsAccueilmentionsComplementaires: 'ETM',
      attDroitsAccueilactionEvt: 'confirmer',
      attDroitsAccueilblocOuvert: true,
      _ct: urlService.getCsrf()
    }
  })
  const $link = $('.r_lien_pdf')
  if ($link.length) {
    return urlService.getDomain() + $link.attr('href')
  }

  return null
}

async function fetchMessages() {
  const $ = await request.get(urlService.getMessagesUrl())
  await refreshCsrf()

  const docs = scrape(
    $,
    {
      vendorRef: {
        sel: 'td:nth-child(1) input',
        attr: 'value'
      },
      from: 'td:nth-child(3)',
      title: 'td:nth-child(4)',
      date: {
        sel: 'td:nth-child(5)',
        parse: date => moment(date, 'DD/MM/YY')
      },
      detailsLink: {
        sel: 'td:nth-child(5) a',
        attr: 'href'
      }
    },
    '#tableauMessagesRecus tbody tr'
  )

  const piecesJointes = []
  for (const doc of docs) {
    const $ = await request(doc.detailsLink)
    const $form = $('#pdfSimple')
    const fileprefix = `${doc.date.format('YYYYMMDD')}_ameli_message_${
      doc.title
    }_${crypto
      .createHash('sha1')
      .update(doc.vendorRef)
      .digest('hex')
      .substr(0, 5)}`
    Object.assign(doc, {
      fileurl: urlService.getDomain() + $form.attr('action'),
      requestOptions: {
        jar: j,
        method: 'POST',
        form: {
          idMessage: $form.find(`[name='idMessage']`).val(),
          telechargementPDF: $form.find(`[name='telechargementPDF']`).val(),
          nomPDF: $form.find(`[name='nomPDF']`).val()
        },
        qs: {
          _ct: urlService.getCsrf()
        }
      },
      filename: `${fileprefix}.pdf`,
      fileAttributes: {
        metadata: {
          carbonCopy: true
        }
      }
    })

    const hasAttachment = $('.telechargement_PJ').length
    if (hasAttachment)
      piecesJointes.push({
        fileurl: urlService.getDomain() + $('.telechargement_PJ').attr('href'),
        filename: fileprefix + '_PJ.pdf',
        vendorRef: doc.vendorRef + '_PJ',
        requestOptions: {
          jar: j,
          qs: {
            _ct: urlService.getCsrf()
          }
        },
        fileAttributes: {
          metadata: {
            carbonCopy: true
          }
        }
      })
  }

  return [...docs, ...piecesJointes]
}

const checkLogin = async function (fields) {
  /* As known in Oct2019, from error message,
     Social Security Number should be 13 chars from this set [0-9AB]
  */

  log('debug', 'Checking the length of the login')
  if (fields.login.length > 13) {
    // remove the key from the social security number
    fields.login = fields.login.replace(/\s/g, '').substr(0, 13)
    log('info', `Fixed the login length to 13`)
  }
  if (fields.login.length < 13) {
    log('info', 'Login is under 13 character')
    throw new Error(errors.LOGIN_FAILED)
  }
  if (!fields.password) {
    log('warn', 'No password set in account, aborting')
    throw new Error(errors.LOGIN_FAILED)
  }
}

const refreshCsrf = async function () {
  const csrfBody = await requestNoCheerio({
    har: {
      method: 'POST',
      url: 'https://assure.ameli.fr/PortailAS/JavaScriptServlet',
      headers: [
        {
          name: 'Host',
          value: 'assure.ameli.fr'
        },
        {
          name: 'Accept',
          value: '*/*'
        },
        {
          name: 'FETCH-CSRF-TOKEN',
          value: '1'
        },
        {
          name: 'Origin',
          value: 'https://assure.ameli.fr'
        }
      ]
    }
  })

  const [, csrf] = csrfBody.split(':')
  urlService.setCsrf(csrf)
}

// Procedure to login to Ameli website.
const logIn = async function (fields) {
  await this.deactivateAutoSuccessfulLogin()
  const login = await classicLogin.bind(this)(fields)
  if (login('[title="Déconnexion du compte ameli"]')) {
    log('debug', 'LOGIN OK')
    await this.notifySuccessfulLogin()
    return await request(urlService.getReimbursementUrl())
  }
}

// fetch the HTML page with the list of health cares
const fetchMainPage = async function () {
  log('debug', 'Fetching the list of bills')

  // We can get the history only 6 months back
  const billUrl = urlService.getBillUrl()

  await request(billUrl)

  const result = await requestNoCheerio(billUrl)
  await refreshCsrf()
  return result
}

// Parse the fetched page to extract bill data.
const parseMainPage = async function (reqNoCheerio) {
  let reimbursements = []
  let i = 0
  const $ = cheerio.load(reqNoCheerio.tableauPaiement)

  // Each bloc represents a month that includes 0 to n reimbursement
  $('.blocParMois').each(function () {
    // It would be too easy to get the full date at the same place
    let year = $($(this).find('.rowdate .mois').get(0)).text()
    year = year.split(' ')[1]

    return $(`[id^=lignePaiement${i++}]`).each(function () {
      const month = $($(this).find('.col-date .mois').get(0)).text()
      const day = $($(this).find('.col-date .jour').get(0)).text()
      const groupAmount = parseAmount(
        $($(this).find('.col-montant span').get(0)).text()
      )
      let date = `${day} ${month} ${year}`
      date = moment(date, 'Do MMMM YYYY')

      // Retrieve and extract the infos needed to generate the pdf
      const attrInfos = $(this).attr('onclick')
      const tokens = attrInfos.split("'")

      const idPaiement = tokens[1]
      const naturePaiement = tokens[3]
      const indexGroupe = tokens[5]
      const indexPaiement = tokens[7]

      const detailsUrl = urlService.getDetailsUrl(
        idPaiement,
        naturePaiement,
        indexGroupe,
        indexPaiement
      )

      // This link seems to not be present in every account
      let link = $(this).find('.downdetail').attr('href')

      if (!link) {
        link = $(this).find('[id^=liendowndecompte]')
      }

      let lineId = indexGroupe + indexPaiement

      let reimbursement = {
        date,
        lineId,
        detailsUrl,
        link,
        idPaiement,
        naturePaiement,
        groupAmount,
        isThirdPartyPayer: naturePaiement === 'PAIEMENT_A_UN_TIERS',
        beneficiaries: {}
      }

      reimbursements.push(reimbursement)
    })
  })

  reimbursements = sortBy(reimbursements, x => +x.date)
  return bluebird
    .map(
      reimbursements,
      async reimbursement => {
        const $ = await request(reimbursement.detailsUrl, {
          headers: {
            _ct: urlService.getCsrf()
          }
        })
        if (
          ['PAIEMENT_A_UN_TIERS', 'REMBOURSEMENT_SOINS'].includes(
            reimbursement.naturePaiement
          )
        ) {
          return parseHealthCareDetails($, reimbursement)
        } else if (
          reimbursement.naturePaiement === 'INDEMNITE_JOURNALIERE_ASSURE'
        ) {
          return parseIndemniteJournaliere($, reimbursement)
        }
      },
      { concurrency: 10 }
    )
    .then(() => reimbursements)
}

function parseHealthCareDetails($, reimbursement) {
  let currentBeneficiary = null

  // compatibility code since not every accounts have this kind of links
  if (reimbursement.link == null) {
    reimbursement.link = $('.entete [id^=liendowndecompte]').attr('href')
  }
  if (reimbursement.link == null) {
    log('error', 'Download link not found')
    log('error', $('.entete').html())
  }
  $('.container:not(.entete)').each(function () {
    const $beneficiary = $(this).find('[id^=nomBeneficiaire]')
    if ($beneficiary.length > 0) {
      // a beneficiary container
      currentBeneficiary = $beneficiary.text().trim()
      return null
    }

    // the next container is the list of health cares associated to the beneficiary
    if (currentBeneficiary) {
      parseHealthCares($, this, currentBeneficiary, reimbursement)
      currentBeneficiary = null
    } else {
      // there is some participation remaining for the whole reimbursement
      parseParticipation($, this, reimbursement)
    }
  })
}

function parseAmount(amount) {
  let result = parseFloat(amount.replace(' €', '').replace(',', '.'))
  if (isNaN(result)) result = 0
  return result
}

function parseIndemniteJournaliere($, reimbursement) {
  const parsed = $('detailpaiement > div > h2')
    .text()
    .match(/Paiement effectué le (.*) pour un montant de (.*) €/)

  if (parsed) {
    const [date, amount] = parsed.slice(1, 3)
    Object.assign(reimbursement, {
      date: moment(date, 'DD/MM/YYYY'),
      amount: parseAmount(amount)
    })
  }
  return reimbursement
}

function parseHealthCares($, container, beneficiary, reimbursement) {
  $(container)
    .find('tr')
    .each(function (index) {
      if ($(this).find('th').length > 0) {
        return null // ignore header
      }

      let date = $(this).find('[id^=Nature]').html().split('<br>').pop().trim()
      date = date ? moment(date, 'DD/MM/YYYY') : undefined
      const healthCare = {
        index,
        prestation: $(this).find('.naturePrestation').text().trim(),
        date,
        montantPayé: parseAmount(
          $(this).find('[id^=montantPaye]').text().trim()
        ),
        baseRemboursement: parseAmount(
          $(this).find('[id^=baseRemboursement]').text().trim()
        ),
        taux: $(this).find('[id^=taux]').text().trim(),
        montantVersé: parseAmount(
          $(this).find('[id^=montantVerse]').text().trim()
        )
      }

      reimbursement.beneficiaries[beneficiary] =
        reimbursement.beneficiaries[beneficiary] || []
      reimbursement.beneficiaries[beneficiary].push(healthCare)
    })
}

function parseParticipation($, container, reimbursement) {
  $(container)
    .find('tr')
    .each(function () {
      if ($(this).find('th').length > 0) {
        return null // ignore header
      }

      if (reimbursement.participation) {
        log(
          'warning',
          'There is already a participation, this case is not supposed to happend'
        )
      }
      let date = $(this).find('[id^=dateActePFF]').text().trim()
      date = date ? moment(date, 'DD/MM/YYYY') : undefined
      reimbursement.participation = {
        prestation: $(this).find('[id^=naturePFF]').text().trim(),
        date,
        montantVersé: parseAmount(
          $(this).find('[id^=montantVerse]').text().trim()
        )
      }
    })
}

function getIndemniteBills(reimbursements, login) {
  return reimbursements
    .filter(r => ['INDEMNITE_JOURNALIERE_ASSURE'].includes(r.naturePaiement))
    .map(reimbursement => {
      return {
        type: 'health_costs',
        subtype: 'indemnite_journaliere',
        date: reimbursement.date.toDate(),
        vendor: 'Ameli',
        isRefund: true,
        amount: reimbursement.amount,
        fileurl: 'https://assure.ameli.fr' + reimbursement.link,
        vendorRef: reimbursement.idPaiement,
        filename: getFileName(reimbursement),
        fileAttributes: {
          metadata: {
            carbonCopy: true,
            classification: 'invoicing',
            datetime: reimbursement.date.toDate(),
            datetimeLabel: 'issueDate',
            contentAuthor: 'ameli',
            subClassification: 'payment_statement',
            categories: ['public_service', 'health'],
            issueDate: reimbursement.date.toDate(),
            contractReference: login
          }
        },
        requestOptions: {
          jar: j,
          gzip: true
        }
      }
    })
    .filter(bill => !isNaN(bill.amount))
}

function getHealthCareBills(reimbursements, login) {
  const bills = []
  reimbursements
    .filter(r =>
      ['PAIEMENT_A_UN_TIERS', 'REMBOURSEMENT_SOINS'].includes(r.naturePaiement)
    )
    .forEach(reimbursement => {
      for (const beneficiary in reimbursement.beneficiaries) {
        reimbursement.beneficiaries[beneficiary].forEach(healthCare => {
          const newbill = {
            type: 'health_costs',
            subtype: healthCare.prestation,
            beneficiary,
            isThirdPartyPayer: reimbursement.isThirdPartyPayer,
            date: reimbursement.date.toDate(),
            index: healthCare.index,
            vendor: 'Ameli',
            isRefund: true,
            amount: healthCare.montantVersé,
            originalAmount: healthCare.montantPayé,
            fileurl: 'https://assure.ameli.fr' + reimbursement.link,
            vendorRef: reimbursement.idPaiement,
            filename: getFileName(reimbursement),
            shouldReplaceName: getOldFileName(reimbursement),
            fileAttributes: {
              metadata: {
                carbonCopy: true,
                classification: 'invoicing',
                datetime: reimbursement.date.toDate(),
                datetimeLabel: 'issueDate',
                contentAuthor: 'ameli',
                subClassification: 'payment_statement',
                categories: ['public_service', 'health'],
                issueDate: reimbursement.date.toDate(),
                contractReference: login
              }
            },
            groupAmount: reimbursement.groupAmount,
            requestOptions: {
              jar: j
            }
          }
          if (healthCare.date) {
            newbill.originalDate = healthCare.date.toDate()
          }
          bills.push(new Bill(newbill))
        })
      }

      if (reimbursement.participation) {
        const newbill = {
          type: 'health',
          subtype: reimbursement.participation.prestation,
          isThirdPartyPayer: reimbursement.isThirdPartyPayer,
          date: reimbursement.date.toDate(),
          vendor: 'Ameli',
          isRefund: true,
          amount: reimbursement.participation.montantVersé,
          fileurl: 'https://assure.ameli.fr' + reimbursement.link,
          vendorRef: reimbursement.idPaiement,
          filename: getFileName(reimbursement),
          shouldReplaceName: getOldFileName(reimbursement),
          fileAttributes: {
            metadata: {
              classification: 'invoicing',
              datetime: reimbursement.date.toDate(),
              datetimeLabel: 'issueDate',
              contentAuthor: 'ameli',
              subClassification: 'payment_statement',
              categories: ['public_service', 'health'],
              issueDate: reimbursement.date.toDate(),
              contractReference: login
            }
          },
          groupAmount: reimbursement.groupAmount,
          requestOptions: {
            jar: j
          }
        }
        if (reimbursement.participation.date) {
          newbill.originalDate = reimbursement.participation.date.toDate()
        }
        bills.push(new Bill(newbill))
      }
    })
  return bills.filter(bill => !isNaN(bill.amount))
}

function getFileName(reimbursement) {
  const natureMap = {
    PAIEMENT_A_UN_TIERS: 'tiers_payant',
    REMBOURSEMENT_SOINS: 'remboursement_soins',
    INDEMNITE_JOURNALIERE_ASSURE: 'indemnites_journalieres'
  }

  const nature = natureMap[reimbursement.naturePaiement]
  const amount = reimbursement.groupAmount || reimbursement.amount
  return `${moment(reimbursement.date).format('YYYYMMDD')}_ameli${
    nature ? '_' + nature : ''
  }${amount ? '_' + amount.toFixed(2) + 'EUR' : ''}.pdf`
}

function getOldFileName(reimbursement) {
  return `${moment(reimbursement.date).format('YYYYMMDD')}_ameli.pdf`
}

const fetchIdentity = async function () {
  log('debug', 'Generating identity')
  const infosUrl = urlService.getInfosUrl()
  const $ = await request(infosUrl)

  // Extracting necessary datas
  const givenName = $('.blocNomPrenom .nom').eq(0).text().trim()
  const rawFullName = $('.NomEtPrenomLabel').eq(0).text()
  // Deduce familyName by substracting givenName
  const familyName = rawFullName.replace(givenName, '').trim()
  const birthday = moment(
    $('.blocNomPrenom .dateNaissance').text(),
    'DD/MM/YYYY'
  ).format('YYYY-MM-DD')
  const socialSecurityNumber = $('.blocNumSecu').text().replace(/\s/g, '')
  const rawAddress = $(
    'div[title="Modifier mon adresse postale"] .infoDroite > span'
  )
    .text()
    .replace(/\t/g, '')
    .replace(/\n/g, '')
    // This has been recently added when selecting the wanted element, needs to be remove
    .replace('Cet élément est modifiable', '')
    .trim()

  // Making ident object as io.cozy.contacts
  let ident = {
    name: {
      givenName,
      familyName
    },
    birthday,
    socialSecurityNumber
  }
  if (rawAddress) {
    const postcode = rawAddress.match(/ \d{5}/)[0].trim()
    const [street, city] = rawAddress.split(postcode).map(e => e.trim())
    ident.address = [
      {
        formattedAddress: rawAddress,
        street,
        postcode,
        city
      }
    ]
  }
  return ident
}

// Phone numbers are now obfusctated on the page, No needs to fetch them anymore
// eslint-disable-next-line no-unused-vars
function addPhone(newObj, phoneArray) {
  if (Array.isArray(phoneArray)) {
    phoneArray.push(newObj)
  } else {
    phoneArray = [newObj]
  }
  return phoneArray
}

// eslint-disable-next-line no-unused-vars
async function franceConnectLogin(fields) {
  const form = {
    j_username: fields.login,
    j_password: fields.password,
    j_etape: 'CLASSIQUE'
  }

  await request({
    method: 'GET',
    url: `${urlService.getFranceConnectUrl()}`
  })

  await request({
    method: 'GET',
    url: urlService.getSelectFCServiceUrl()
  })

  await request({
    method: 'POST',
    form,
    url: urlService.getSubmitFCLoginUrl()
  })

  const $FClogin = await request({
    method: 'POST',
    url: urlService.getTriggerFCRedirectUrl()
  })

  if ($FClogin('[title="Déconnexion du compte ameli"]').length !== 1) {
    log('debug', 'Something unexpected went wrong after the login')
    if ($FClogin.html().includes('modif_code_perso_ameli_apres_reinit')) {
      log('info', 'Password renew required, user action is needed')
      throw new Error(errors.USER_ACTION_NEEDED)
    }
    const errorMessage = $FClogin('.centrepage h1, .centrepage h2').text()
    if (errorMessage) {
      log('error', errorMessage)
      if (errorMessage === 'Compte bloqué') {
        throw new Error('LOGIN_FAILED.TOO_MANY_ATTEMPTS')
      } else if (errorMessage.includes('Service momentanément indisponible')) {
        throw new Error(errors.VENDOR_DOWN)
      } else {
        const refreshContent = $FClogin('meta[http-equiv=refresh]').attr(
          'content'
        )
        if (refreshContent) {
          log('error', 'refreshContent')
          log('error', refreshContent)
          if (refreshContent.includes('as_saisie_mail_connexionencours_page')) {
            log('warn', 'User needs to confirm email address')
            throw new Error(errors.USER_ACTION_NEEDED)
          } else {
            log('error', 'Found redirect comment but no login form')
            throw new Error(errors.VENDOR_DOWN)
          }
        } else {
          log('error', 'Unknown error message')
          throw new Error(errors.VENDOR_DOWN)
        }
      }
    }
    log('debug', 'Logout button not detected, but for an unknown case')
    throw new Error(errors.VENDOR_DOWN)
  } else {
    return $FClogin
  }
}

async function classicLogin(fields) {
  // First request to get the cookie
  const baseReq = await request({
    url: urlService.getLoginUrl(),
    resolveWithFullResponse: true
  })
  const baseReqBody = baseReq.body.html()
  let nextUrl = baseReq.request.href
  const $LoginForm = cheerio.load(baseReqBody)
  const lmhidden_state = $LoginForm('#lmhidden_state').attr('value')
  const lmhidden_response_type = $LoginForm('#lmhidden_response_type').attr(
    'value'
  )
  const lmhidden_scope = $LoginForm('#lmhidden_scope').attr('value')
  const lmhidden_nonce = $LoginForm('#lmhidden_nonce').attr('value')
  const lmhidden_redirect_uri = $LoginForm('#lmhidden_redirect_uri').attr(
    'value'
  )
  const lmhidden_client_id = $LoginForm('#lmhidden_client_id').attr('value')
  const firstForm = {
    lmhidden_state,
    lmhidden_response_type,
    lmhidden_scope,
    lmhidden_nonce,
    lmhidden_redirect_uri,
    lmhidden_client_id,
    url: '',
    timezone: '',
    lmAuth: 'LOGIN',
    skin: 'cnamts',
    user: fields.login,
    password: fields.password,
    authStep: '',
    submit: 'me+connecter'
  }
  const loginReq1 = await request({
    method: 'POST',
    url: nextUrl,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    resolveWithFullResponse: true,
    form: { ...firstForm }
  })
  const loginReq1Body = loginReq1.body.html()
  const $loginFirstStep = cheerio.load(loginReq1Body)
  if ($loginFirstStep('.zone-alerte:not([class*=" "])').length === 1) {
    log('error', 'Couple login/password error')
    throw new Error('LOGIN_FAILED')
  }
  if ($loginFirstStep('#BoutonGenerationOTP').length === 0) {
    log(
      'info',
      'First login step went wrong, button for sending OTP mail did not show up'
    )
    throw new Error('LOGIN_FAILED')
  }
  log('info', 'firstStep login - OK')
  const formattedLogin = fields.login.replace(
    /(\d)(\d{2})(\d{2})(\d{2})(\d{3})(\d{3})/g,
    '$1+$2+$3+$4+$5+$6'
  )
  const valuesToEncode = {
    lmhidden_state,
    lmhidden_response_type,
    lmhidden_scope,
    lmhidden_nonce,
    lmhidden_redirect_uri,
    lmhidden_client_id
  }
  const encodedFormPart = {}
  for (const cle in valuesToEncode) {
    if (typeof valuesToEncode[cle] === 'string') {
      encodedFormPart[cle] = encodeURIComponent(valuesToEncode[cle])
    }
  }
  const lmAuth = 'LOGIN'
  const skin = 'cnamts'
  const user = formattedLogin
  const password = fields.password
  const sharedBodyForm = `lmhidden_state=${encodedFormPart.lmhidden_state}&lmhidden_response_type=${encodedFormPart.lmhidden_response_type}&lmhidden_scope=${encodedFormPart.lmhidden_scope}&lmhidden_nonce=${encodedFormPart.lmhidden_nonce}&lmhidden_redirect_uri=${encodedFormPart.lmhidden_redirect_uri}&lmhidden_client_id=${encodedFormPart.lmhidden_client_id}&url=&timezone=&lmAuth=${lmAuth}&skin=${skin}&user=${user}&password=${password}&`

  const getOTPStep = 'ENVOI_OTP'
  const envoiOTP = 'Recevoir+un+code+de+s%C3%A9curit%C3%A9'
  const triggerOTPForm = `${sharedBodyForm}authStep=${getOTPStep}&envoiOTP=${envoiOTP}`
  const loginReq2 = await request({
    method: 'POST',
    url: nextUrl,
    resolveWithFullResponse: true,
    form: triggerOTPForm
  })
  const loginReq2Body = loginReq2.body.html()
  const $loginSecondStep = cheerio.load(loginReq2Body)
  if ($loginSecondStep('#numOTP1').length === 0) {
    throw new Error('Something went wrong when asking for OTP code')
  }
  log('debug', 'First login part OK, waiting for OTP code')
  let code = await this.waitForTwoFaCode({
    type: 'email'
  })
  if (code.length !== 6) {
    throw new Error('OTP code must have a length of 6')
  }
  const [num1, num2, num3, num4, num5, num6] = code
  const typeinOTPStep = 'SAISIE_OTP'
  const sendOTPForm = `${sharedBodyForm}authStep=${typeinOTPStep}&numOTP1=${num1}&numOTP2=${num2}&numOTP3=${num3}&numOTP4=${num4}&numOTP5=${num5}&numOTP6=${num6}&enrolerDevice=on&submit=me%2Bconnecter`
  const loginReqOTP = await request({
    method: 'POST',
    url: nextUrl,
    resolveWithFullResponse: true,
    followAllRedirects: true,
    form: sendOTPForm
  })

  const loginReqOTPBody = loginReqOTP.body.html()
  const $loginOTPStep = cheerio.load(loginReqOTPBody)
  if ($loginOTPStep('a[title="Déconnexion du compte ameli"]').length === 0) {
    throw new Error('Something went wrong when asking for OTP code')
  }
  log('info', 'Login successfull !')
  // For users consent reasons, we got to ask for user's permission to login through FranceConnect.
  // As a result, we keep the code allowing this connection but until we find a solution to this issue, we must not try to login through FranceConnect.
  // If needed use function checkMaintenance()

  // All the login failed part is has been redone, but for this case, we couldn't tell for sure it's always functional
  // So we keeping this arround for later use
  // const visibleZoneAlerte = $loginOTPStep('.zone-alerte').filter(
  //   (i, el) => !$(el).hasClass('invisible')
  // )
  // // User seems not affiliated anymore to Régime Général
  // const NotMoreAffiliatedString =
  //   'vous ne dépendez plus du régime général de' + ` l'Assurance Maladie`
  // if (visibleZoneAlerte.text().includes(NotMoreAffiliatedString)) {
  //   throw new Error(errors.USER_ACTION_NEEDED_ACCOUNT_REMOVED)
  // }

  // The user must validate the CGU form
  const $cgu = $loginOTPStep('#nouvelles_cgu_1erreurBoxAccepte')
  if ($cgu.length > 0) {
    log('debug', $cgu.attr('content'))
    throw new Error('USER_ACTION_NEEDED.CGU_FORM')
  }
  // Default case. Something unexpected went wrong after the login
  if ($loginOTPStep('[title="Déconnexion du compte ameli"]').length !== 1) {
    log('debug', 'Something unexpected went wrong after the login')
    if ($loginOTPStep.html().includes('modif_code_perso_ameli_apres_reinit')) {
      log('info', 'Password renew required, user action is needed')
      throw new Error(errors.USER_ACTION_NEEDED)
    }
    const errorMessage = $loginOTPStep('.centrepage h1, .centrepage h2').text()
    if (errorMessage) {
      log('error', errorMessage)
      if (errorMessage === 'Compte bloqué') {
        throw new Error('LOGIN_FAILED.TOO_MANY_ATTEMPTS')
      } else if (errorMessage.includes('Service momentanément indisponible')) {
        throw new Error(errors.VENDOR_DOWN)
      } else {
        const refreshContent = $loginOTPStep('meta[http-equiv=refresh]').attr(
          'content'
        )
        if (refreshContent) {
          log('error', 'refreshContent')
          log('error', refreshContent)
          if (refreshContent.includes('as_saisie_mail_connexionencours_page')) {
            log('warn', 'User needs to confirm email address')
            throw new Error(errors.USER_ACTION_NEEDED)
          } else {
            log('error', 'Found redirect comment but no login form')
            throw new Error(errors.VENDOR_DOWN)
          }
        } else {
          log('error', 'Unknown error message')
          throw new Error(errors.VENDOR_DOWN)
        }
      }
    }
    log('debug', 'Logout button not detected, but for an unknown case')
    throw new Error(errors.VENDOR_DOWN)
  }
  return $loginOTPStep
}

// eslint-disable-next-line no-unused-vars
async function checkMaintenance(loginPage, fields) {
  if (
    loginPage.body
      .html()
      .includes(
        'Suite à une opération de maintenance, cliquez sur FranceConnect et utilisez vos identifiants ameli pour accéder à votre compte.'
      )
  ) {
    log(
      'debug',
      'Ameli website has ongoing maintenance, trying to connect with FranceConnect'
    )
    const FCLogin = await franceConnectLogin(fields)
    if (FCLogin('[title="Déconnexion du compte ameli"]')) {
      log('debug', 'LOGIN OK')
      await this.notifySuccessfulLogin()
      return await request(urlService.getReimbursementUrl())
    }
  }
}
