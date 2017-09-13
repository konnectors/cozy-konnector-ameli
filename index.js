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
  .then((reimbursements) => getBills(reimbursements))
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
  .catch(err => {
    log('error', err.message, 'Error intercepted')
  })
})

const checkLogin = function (fields) {
  log('info', 'Checking the length of the login')
  log('info', fields.login.length, 'login length')
  if (fields.login.length > 13) {
    return Promise.reject(new Error('LOGIN_FAILED'))
  }

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

  // Get the start and end date to generate the bill's url
  const endDate = $('#paiements_1dateFin').attr('value')

  const baseUrl = 'https://assure.ameli.fr/PortailAS/paiements.do?actionEvt='

  // We can get the history only 6 months back
  const startDate = moment(endDate, 'DD/MM/YYYY').subtract(6, 'months').format('DD/MM/YYYY')

  const billUrl = `${baseUrl}afficherPaiementsComplementaires&DateDebut=${startDate}&DateFin=${endDate}\
&Beneficiaire=tout_selectionner&afficherReleves=false&afficherIJ=false&afficherInva=false&afficherRentes=false\
&afficherRS=false&indexPaiement=&idNotif=`

  const reimbursements = []

  return rq(billUrl)
  .then($ => {
    let i = 0

    // Each bloc represents a month that includes 0 to n reimbursement
    $('.blocParMois').each(function () {
      // It would be too easy to get the full date at the same place
      let year = $($(this).find('.rowdate .mois').get(0)).text()
      year = year.split(' ')[1]

      return $(`[id^=lignePaiement${i++}]`).each(function () {
        const month = $($(this).find('.col-date .mois').get(0)).text()
        const day = $($(this).find('.col-date .jour').get(0)).text()
        let date = `${day} ${month} ${year}`
        moment.locale('fr')
        date = moment(date, 'Do MMMM YYYY')

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

        let reimbursement = {
          date,
          lineId,
          detailsUrl
        }

        if (naturePaiement === 'REMBOURSEMENT_SOINS') {
          reimbursements.push(reimbursement)
        }
      })
    })
    return bluebird.each(reimbursements, reimbursement => {
      return rq(reimbursement.detailsUrl)
      .then($ => {
        // get the health cares related to the given reimbursement
        const rows = []
        $('#tableauPrestation tbody tr').each(function () {
          const cells = $(this).find('td').map(function (index) {
            if (index === 0) return [$(this).find('.naturePrestation').text().trim(), $(this).html().split('<br>').pop().trim()]
            return $(this).text().trim()
          }).get()
          if (cells.length === 6 && cells[0].trim() !== 'participation forfaitaire') {
            // also get what is need for the pdf url
            cells.push($(`[id=liendowndecompte${reimbursement.lineId}]`).attr('href'))
            rows.push(cells)
          }
        })
        reimbursement.rows = rows
      })
    })
  })
  .then(() => reimbursements)
}

function getBills (reimbursements) {
  const bills = []
  reimbursements.forEach(reimbursement => {
    reimbursement.rows.forEach(row => bills.push({
      type: 'health',
      subtype: row[0],
      date: reimbursement.date.toDate(),
      originalDate: moment(row[1], 'DD/MM/YYYY').toDate(),
      vendor: 'Ameli',
      amount: parseFloat(row[5].replace(' €', '').replace(',', '.')),
      originalAmount: parseFloat(row[2].replace(' €', '').replace(',', '.')),
      fileurl: 'https://assure.ameli.fr' + row[6],
      filename: getFileName(reimbursement.date)
    }))
  })
  return bills
}

function getFileName (date) {
  return `${moment(date).format('YYYYMMDD')}_ameli.pdf`
}
