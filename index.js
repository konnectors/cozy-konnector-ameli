'use strict'

const {log, BaseKonnector, saveBills, request} = require('cozy-konnector-libs')
const moment = require('moment')
const bluebird = require('bluebird')

let rq = request({
  // debug: true,
  cheerio: true,
  json: false,
  jar: true
})

module.exports = new BaseKonnector(function fetch (fields) {
  return checkLogin(fields)
  .then(() => logIn(fields))
  .then($ => parsePage($))
  .then(entries => {
    // get custom bank identifier if any
    let identifiers = 'C.P.A.M.'
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

const checkLogin = function (fields) {
  log('info', 'Checking the length of the login')
  if (fields.login.length > 13) return Promise.reject(new Error('LOGIN_FAILED'))

  return Promise.resolve()
}

// Procedure to login to Ameli website.
const logIn = function (fields) {
  log('info', 'Now logging in')
  const loginUrl = 'https://assure.ameli.fr/PortailAS/appmanager/PortailAS/assure?_somtc=true'

  const submitUrl = 'https://assure.ameli.fr/PortailAS/appmanager/PortailAS/' +
    'assure?_nfpb=true&_windowLabel=connexioncompte_2&connexioncompte_2_' +
    'actionOverride=/portlets/connexioncompte/validationconnexioncompte&_pageLabel=as_login_page'

  const reimbursementUrl = 'https://assure.ameli.fr/PortailAS/appmanager/PortailAS/assure?_nfpb=true&_pageLabel=as_paiements_page'

  const form = {
    'connexioncompte_2numSecuriteSociale': fields.login,
    'connexioncompte_2codeConfidentiel': fields.password,
    'connexioncompte_2actionEvt': 'connecter',
    'submit': 'Valider'
  }

  return rq({
    url: loginUrl,
    resolveWithFullResponse: true
  })
  // First request to get the cookie
  .then(res => rq({
    method: 'POST',
    form,
    url: submitUrl
  }))
  // Second request to authenticate
  .then($ => {
    if ($('[title="Déconnexion du compte ameli"]').length !== 1) {
      throw new Error('LOGIN_FAILED')
    }

    log('info', 'Correctly logged in')
    return rq(reimbursementUrl)
  })
}

// Parse the fetched page to extract bill data.
const parsePage = function ($) {
  log('info', 'Fetching the list of bills')
  const entries = []

  // Get the start and end date to generate the bill's url
  const endDate = $('#paiements_1dateFin').attr('value')

  const baseUrl = 'https://assure.ameli.fr/PortailAS/paiements.do?actionEvt='

  // We can get the history only 6 months back
  const startDate = moment(endDate, 'DD/MM/YYYY').subtract(6, 'months').format('DD/MM/YYYY')

  const billUrl = `${baseUrl}afficherPaiementsComplementaires&DateDebut=${startDate}&DateFin=${endDate}\
&Beneficiaire=tout_selectionner&afficherReleves=false&afficherIJ=false&afficherInva=false&afficherRentes=false\
&afficherRS=false&indexPaiement=&idNotif=`

  return rq(billUrl)
  .then($ => {
    let i = 0

    // Each bloc represents a month that includes 0 to n reimbursement
    $('.blocParMois').each(function () {
      // It would be too easy to get the full date at the same place
      let year = $($(this).find('.rowdate .mois').get(0)).text()
      year = year.split(' ')[1]

      return $(`[id^=lignePaiement${i++}]`).each(function () {
        let amount = $($(this).find('.col-montant').get(0)).text()
        amount = amount.replace(' €', '').replace(',', '.')
        amount = parseFloat(amount)

        const month = $($(this).find('.col-date .mois').get(0)).text()
        const day = $($(this).find('.col-date .jour').get(0)).text()
        let date = `${day} ${month} ${year}`
        moment.locale('fr')
        date = moment(date, 'Do MMMM YYYY')

        const label = $($(this).find('.col-label').get(0)).text()

        // Retrieve and extract the infos needed to generate the pdf
        const attrInfos = $(this).attr('onclick')
        const tokens = attrInfos.split("'")

        const idPaiement = tokens[1]
        const naturePaiement = tokens[3]
        const indexGroupe = tokens[5]
        const indexPaiement = tokens[7]

        const detailsUrl = `${baseUrl}chargerDetailPaiements\
&idPaiement=${idPaiement}\
&naturePaiement=${naturePaiement}\
&indexGroupe=${indexGroupe}\
&indexPaiement=${indexPaiement}`

        let lineId = indexGroupe + indexPaiement

        let bill = {
          amount,
          type: 'health',
          subtype: label,
          date: date.toDate(),
          vendor: 'Ameli',
          lineId,
          detailsUrl
        }

        if (bill.amount != null && naturePaiement === 'REMBOURSEMENT_SOINS') { return entries.push(bill) }
      })
    })
    return bluebird.each(entries, getPdf)
  })
}

const getPdf = function (bill) {
  // Request the generated url to get the detailed pdf
  return rq(bill.detailsUrl)
  .then($ => {
    let pdfUrl = $(`[id=liendowndecompte${bill.lineId}]`).attr('href')
    if (pdfUrl) {
      bill.fileurl = `https://assure.ameli.fr${pdfUrl}`
      bill.filename = getFileName(bill.date)
    }
    return bill
  })
}

function getFileName (date) {
  return `${moment(date).format('YYYYMMDD')}_ameli.pdf`
}
