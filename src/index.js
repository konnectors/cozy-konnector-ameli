'use strict'

// Force sentry DSN into environment variables
// In the future, will be set by the stack
process.env.SENTRY_DSN =
  process.env.SENTRY_DSN ||
  'https://ae2447d6c4544985ae50a03520a06f89:5371dd68dfea408bbd9fbc8c97a9309a@sentry.cozycloud.cc/14'

const {
  log,
  BaseKonnector,
  saveBills,
  requestFactory,
  errors
} = require('cozy-konnector-libs')
const moment = require('moment')
const sortBy = require('lodash/sortBy')
moment.locale('fr')
const bluebird = require('bluebird')
const Bill = require('./bill')

const urlService = require('./urlService')

let request = requestFactory()
const j = request.jar()
request = requestFactory({
  // debug: true,
  cheerio: true,
  json: false,
  jar: j
})

module.exports = new BaseKonnector(function fetch(fields) {
  return checkLogin(fields)
    .then(() => logIn(fields))
    .then(fetchMainPage)
    .then($ => parseMainPage($))
    .then(reimbursements => getBills(reimbursements))
    .then(entries => {
      // get custom bank identifier if any
      let identifiers = ['c.p.a.m.', 'caisse', 'cpam', 'ameli']
      if (fields.bank_identifier && fields.bank_identifier.length) {
        identifiers = fields.bank_identifier
      }

      return saveBills(entries, fields.folderPath, {
        timeout: Date.now() + 60 * 1000,
        identifiers,
        dateDelta: 10,
        amountDelta: 0.1
      })
    })
})

const checkLogin = function(fields) {
  log('info', 'Checking the length of the login')
  if (fields.login.length > 13) {
    // remove the key from the social security number
    fields.login = fields.login.substr(0, 13)
    log('debug', `Fixed the login length to 13`)
  }

  return Promise.resolve()
}

// Procedure to login to Ameli website.
const logIn = async function(fields) {
  log('info', 'Now logging in')

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

  const $ = await request({
    method: 'POST',
    form,
    url: urlService.getSubmitUrl()
  })

  if ($('#connexioncompte_2nir_as').length) {
    throw new Error(errors.LOGIN_FAILED)
  }

  // The user must validate the CGU form
  const $cgu = $('meta[http-equiv=refresh]')
  if (
    $cgu.length > 0 &&
    $cgu.attr('content').includes('as_conditions_generales_page')
  ) {
    log('debug', $cgu.attr('content'))
    throw new Error('USER_ACTION_NEEDED.CGU_FORM')
  }

  // Default case. Something unexpected went wrong after the login
  if ($('[title="Déconnexion du compte ameli"]').length !== 1) {
    log('debug', $('body').html(), 'No deconnection link found in the html')
    log('debug', 'Something unexpected went wrong after the login')
    if ($('.centrepage h2, .centrepage h1')) {
      const errorMessage = $('.centrepage h1, .centrepage h2').text()
      log('error', errorMessage)
      if (errorMessage === 'Compte bloqué') {
        throw new Error('LOGIN_FAILED.TOO_MANY_ATTEMPTS')
      } else {
        log('error', 'Found redirect comment but no login form')
        throw new Error(errors.VENDOR_DOWN)
      }
    }
    throw new Error(errors.LOGIN_FAILED)
  }

  log('info', 'Correctly logged in')

  return await request(urlService.getReimbursementUrl())
}

// fetch the HTML page with the list of health cares
const fetchMainPage = async function() {
  log('info', 'Fetching the list of bills')

  // We can get the history only 6 months back
  const billUrl = urlService.getBillUrl()

  await request(billUrl)

  return request(billUrl)
}

// Parse the fetched page to extract bill data.
const parseMainPage = function($) {
  let reimbursements = []
  let i = 0

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
      reimbursement => {
        log(
          'info',
          `Fetching details for ${reimbursement.date} ${
            reimbursement.groupAmount
          }`
        )
        return request(reimbursement.detailsUrl).then($ =>
          parseDetails($, reimbursement)
        )
      },
      { concurrency: 10 }
    )
    .then(() => reimbursements)
}

function parseDetails($, reimbursement) {
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

function parseHealthCares($, container, beneficiary, reimbursement) {
  $(container)
    .find('tr')
    .each(function() {
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

function getBills(reimbursements) {
  const bills = []
  reimbursements.forEach(reimbursement => {
    for (const beneficiary in reimbursement.beneficiaries) {
      reimbursement.beneficiaries[beneficiary].forEach(healthCare => {
        const newbill = {
          type: 'health_costs',
          subtype: healthCare.prestation,
          beneficiary,
          isThirdPartyPayer: reimbursement.isThirdPartyPayer,
          date: reimbursement.date.toDate(),
          vendor: 'Ameli',
          isRefund: true,
          amount: healthCare.montantVersé,
          originalAmount: healthCare.montantPayé,
          fileurl: 'https://assure.ameli.fr' + reimbursement.link,
          filename: getFileName(reimbursement.date),
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
        filename: getFileName(reimbursement.date),
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

function getFileName(date) {
  return `${moment(date).format('YYYYMMDD')}_ameli.pdf`
}
