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

const checkLogin = async function(fields) {
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

const refreshCsrf = async function() {
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
const logIn = async function(fields) {
  await this.deactivateAutoSuccessfulLogin()
  const login = await classicLogin(fields)
  if (login('[title="Déconnexion du compte ameli"]')) {
    log('debug', 'LOGIN OK')
    await this.notifySuccessfulLogin()
    return await request(urlService.getReimbursementUrl())
  }
}

// fetch the HTML page with the list of health cares
const fetchMainPage = async function() {
  log('debug', 'Fetching the list of bills')

  // We can get the history only 6 months back
  const billUrl = urlService.getBillUrl()

  await request(billUrl)

  const result = await requestNoCheerio(billUrl)
  await refreshCsrf()
  return result
}

// Parse the fetched page to extract bill data.
const parseMainPage = async function(reqNoCheerio) {
  let reimbursements = []
  let i = 0
  const $ = cheerio.load(reqNoCheerio.tableauPaiement)

  // Each bloc represents a month that includes 0 to n reimbursement
  $('.blocParMois').each(function() {
    // It would be too easy to get the full date at the same place
    let year = $(
      $(this)
        .find('.rowdate .mois')
        .get(0)
    ).text()
    year = year.split(' ')[1]

    return $(`[id^=lignePaiement${i++}]`).each(function() {
      const month = $(
        $(this)
          .find('.col-date .mois')
          .get(0)
      ).text()
      const day = $(
        $(this)
          .find('.col-date .jour')
          .get(0)
      ).text()
      const groupAmount = parseAmount(
        $(
          $(this)
            .find('.col-montant span')
            .get(0)
        ).text()
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
      let link = $(this)
        .find('.downdetail')
        .attr('href')

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
  $('.container:not(.entete)').each(function() {
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
    .each(function(index) {
      if ($(this).find('th').length > 0) {
        return null // ignore header
      }

      let date = $(this)
        .find('[id^=Nature]')
        .html()
        .split('<br>')
        .pop()
        .trim()
      date = date ? moment(date, 'DD/MM/YYYY') : undefined
      const healthCare = {
        index,
        prestation: $(this)
          .find('.naturePrestation')
          .text()
          .trim(),
        date,
        montantPayé: parseAmount(
          $(this)
            .find('[id^=montantPaye]')
            .text()
            .trim()
        ),
        baseRemboursement: parseAmount(
          $(this)
            .find('[id^=baseRemboursement]')
            .text()
            .trim()
        ),
        taux: $(this)
          .find('[id^=taux]')
          .text()
          .trim(),
        montantVersé: parseAmount(
          $(this)
            .find('[id^=montantVerse]')
            .text()
            .trim()
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
    .each(function() {
      if ($(this).find('th').length > 0) {
        return null // ignore header
      }

      if (reimbursement.participation) {
        log(
          'warning',
          'There is already a participation, this case is not supposed to happend'
        )
      }
      let date = $(this)
        .find('[id^=dateActePFF]')
        .text()
        .trim()
      date = date ? moment(date, 'DD/MM/YYYY') : undefined
      reimbursement.participation = {
        prestation: $(this)
          .find('[id^=naturePFF]')
          .text()
          .trim(),
        date,
        montantVersé: parseAmount(
          $(this)
            .find('[id^=montantVerse]')
            .text()
            .trim()
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

const fetchIdentity = async function() {
  log('debug', 'Generating identity')
  const infosUrl = urlService.getInfosUrl()
  const $ = await request(infosUrl)

  // Extracting necessary datas
  const givenName = $('.blocNomPrenom .nom')
    .eq(0)
    .text()
    .trim()
  const rawFullName = $('.NomEtPrenomLabel')
    .eq(0)
    .text()
  // Deduce familyName by substracting givenName
  const familyName = rawFullName.replace(givenName, '').trim()
  const birthday = moment(
    $('.blocNomPrenom .dateNaissance').text(),
    'DD/MM/YYYY'
  ).format('YYYY-MM-DD')
  const socialSecurityNumber = $('.blocNumSecu')
    .text()
    .replace(/\s/g, '')
  const rawAddress = $('div[title="Modifier mon adresse postale"] .infoDroite')
    .text()
    .trim()
  const rawMobile = $('div[title="Modifier mes numéros de télephone"]')
    .eq(0)
    .find('.infoDroite')
    .text()
    .trim()
  const rawFixe = $('div[title="Modifier mes numéros de télephone"]')
    .eq(1)
    .find('.infoDroite')
    .text()
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
  if (rawMobile != '') {
    const mobileNumber = rawMobile.replace(/[^0-9]/g, '')
    ident.phone = addPhone(
      {
        type: 'mobile',
        number: mobileNumber
      },
      ident.phone
    )
  }
  if (rawFixe != 'Ajouter') {
    const fixeNumber = rawFixe.replace(/[^0-9]/g, '')
    ident.phone = addPhone(
      {
        type: 'home',
        number: fixeNumber
      },
      ident.phone
    )
  }
  return ident
}

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
  const form = {
    connexioncompte_2numSecuriteSociale: fields.login,
    connexioncompte_2codeConfidentiel: fields.password,
    connexioncompte_2actionEvt: 'connecter',
    submit: 'me+connecter'
  }
  // First request to get the cookie
  await request({
    url: urlService.getLoginUrl(),
    resolveWithFullResponse: true
  })

  // For users consent reasons, we got to ask for user's permission to login through FranceConnect.
  // As a result, we keep the code allowing this connection but until we find a solution to this issue, we must not try to login through FranceConnect.
  // If needed use function checkMaintenance()

  await refreshCsrf()
  form._ct = urlService.getCsrf()
  const $ = await request({
    method: 'POST',
    form,
    url: urlService.getSubmitUrl()
  })
  const visibleZoneAlerte = $('.zone-alerte').filter(
    (i, el) => !$(el).hasClass('invisible')
  )
  if (visibleZoneAlerte.length > 0) {
    log('warn', 'One or several alert showed to user:')
    log('warn', visibleZoneAlerte.text())
  }
  // Real LOGIN_FAILED case, clearly announce to user from website
  const loginFailedStrings = [
    'Le numéro de sécurité sociale et le code personnel ne correspondent pas',
    'Votre numéro de Sécurité sociale doit contenir des chiffres, A ou B'
  ]
  if (loginFailedStrings.some(str => visibleZoneAlerte.text().includes(str))) {
    throw new Error(errors.LOGIN_FAILED)
  }
  // User seems not affiliated anymore to Régime Général
  const NotMoreAffiliatedString =
    'vous ne dépendez plus du régime général de' + ` l'Assurance Maladie`
  if (visibleZoneAlerte.text().includes(NotMoreAffiliatedString)) {
    throw new Error(errors.USER_ACTION_NEEDED_ACCOUNT_REMOVED)
  }
  // The user must validate the CGU form
  const $cgu = $('meta[http-equiv=refresh]')
  if (
    $cgu.length > 0 &&
    $cgu.attr('content') &&
    $cgu.attr('content').includes('as_conditions_generales_page')
  ) {
    log('debug', $cgu.attr('content'))
    throw new Error('USER_ACTION_NEEDED.CGU_FORM')
  }
  // Default case. Something unexpected went wrong after the login
  if ($('[title="Déconnexion du compte ameli"]').length !== 1) {
    log('debug', 'Something unexpected went wrong after the login')
    if ($.html().includes('modif_code_perso_ameli_apres_reinit')) {
      log('info', 'Password renew required, user action is needed')
      throw new Error(errors.USER_ACTION_NEEDED)
    }
    const errorMessage = $('.centrepage h1, .centrepage h2').text()
    if (errorMessage) {
      log('error', errorMessage)
      if (errorMessage === 'Compte bloqué') {
        throw new Error('LOGIN_FAILED.TOO_MANY_ATTEMPTS')
      } else if (errorMessage.includes('Service momentanément indisponible')) {
        throw new Error(errors.VENDOR_DOWN)
      } else {
        const refreshContent = $('meta[http-equiv=refresh]').attr('content')
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
  return $
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
