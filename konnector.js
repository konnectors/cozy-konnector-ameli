'use strict'

const {baseKonnector, filterExisting, saveDataAndFile, linkBankOperation, models} = require('cozy-konnector-libs')
const request = require('request')
const moment = require('moment')
const cheerio = require('cheerio')
const async = require('async')

const Bill = models.bill

// const localization = require('../lib/localization_manager')

const log = require('printit')({
  prefix: 'Ameli',
  date: true
})

const checkLogin = function (requiredFields, billInfos, data, next) {
  if (requiredFields.login.length > 13) {
    log.error(`Login with ${requiredFields.login.length} digits : refused`)
    return next('bad credentials')
  } else { return next() }
}

// Procedure to login to Ameli website.
const logIn = function (requiredFields, billInfos, data, next) {
  const loginUrl = 'https://assure.ameli.fr/PortailAS/appmanager/PortailAS/' +
    'assure?_somtc=true'

  const submitUrl = 'https://assure.ameli.fr/PortailAS/appmanager/PortailAS/' +
    'assure?_nfpb=true&_windowLabel=connexioncompte_2&connexioncompte_2_' +
    'actionOverride=/portlets/connexioncompte/validationconnexioncompte&' +
    '_pageLabel=as_login_page'

  const reimbursementUrl = 'https://assure.ameli.fr/PortailAS/appmanager/' +
    'PortailAS/assure?_nfpb=true&_pageLabel=as_paiements_page'

  const refererUrl = 'https://assure.ameli.fr/PortailAS/appmanager/' +
    'PortailAS/assure?_nfpb=true&_pageLabel=as_login_page'

  const form = {
    'connexioncompte_2numSecuriteSociale': requiredFields.login,
    'connexioncompte_2codeConfidentiel': requiredFields.password,
    'connexioncompte_2actionEvt': 'connecter',
    'submit': 'Valider'
  }

  let options = {
    method: 'GET',
    jar: true,
    strictSSL: false,
    url: loginUrl
  }

  // First request to get the cookie
  return request(options, function (err, res, body) {
    if (err) {
      log.error(err)
      return next('request error')
    } else {
      const loginOptions = {
        method: 'POST',
        form,
        jar: true,
        strictSSL: false,
        url: submitUrl,
        headers: {
          'Cookie': res.headers['set-cookie'],
          'Referer': refererUrl
        }
      }

      // Second request to authenticate
      return request(loginOptions, function (err, res, body) {
        const $ = cheerio.load(body)
        if (err) {
          log.error(err)
          return next('bad credentials')
        } else if ($('[title="Déconnexion du compte ameli"]').length !== 1) {
          log.error('Authentication error')
          return next('bad credentials')
        } else {
          const reimbursementOptions = {
            method: 'GET',
            jar: true,
            strictSSL: false,
            headers: {
              'Cookie': res.headers['set-cookie'],
              'Referer': refererUrl
            },
            url: reimbursementUrl
          }

          // Last request to get the reimbursements page
          return request(reimbursementOptions, function (err, res, body) {
            if (err) {
              log.error(err)
              return next('request error')
            } else {
              data.html = body
              return next()
            }
          })
        }
      })
    }
  })
}

// Parse the fetched page to extract bill data.
const parsePage = function (requiredFields, healthBills, data, next) {
  healthBills.fetched = []
  if ((data.html == null)) { return next() }

  const $ = cheerio.load(data.html)

  // Get the start and end date to generate the bill's url
  const startDate = $('#paiements_1dateDebut').attr('value')
  const endDate = $('#paiements_1dateFin').attr('value')

  const baseUrl = 'https://assure.ameli.fr/PortailAS/paiements.do?actionEvt='

  // let billUrlOld = baseUrl + 'afficherPaiementsComplementaires&DateDebut='
  // billUrl += (startDate + '&DateFin=' + endDate)
  // billUrl += '&Beneficiaire=tout_selectionner&afficherReleves=false&' +
  //   'afficherIJ=false&afficherInva=false&afficherRentes=false&afficherRS=' +
  //   'false&indexPaiement=&idNotif='

  const billUrl = `${baseUrl}afficherPaiementsComplementaires\
&DateDebut=${startDate}\
&DateFin=${endDate}\
&Beneficiaire=tout_selectionner\
&afficherReleves=false\
&afficherIJ=false\
&afficherInva=false\
&afficherRentes=false\
&afficherRS=false\
&indexPaiement=\
&idNotif=`
  // https://assure.ameli.fr/PortailAS/paiements.do?actionEvt=afficherPaiementsComplementaires&DateDebut=28/04/2017&DateFin=28/06/2017&Beneficiaire=tout_selectionner&afficherReleves=false&afficherIJ=false&afficherInva=false&afficherRentes=false&afficherRS=false&indexPaiement=&idNotif=

  console.log('IT WORKS', billUrl)
  const billOptions = {
    jar: true,
    strictSSL: false,
    url: billUrl
  }

  return request(billOptions, function (err, res, body) {
    if (err) {
      log.error(err)
      return next('request error')
    } else {
      const $ = cheerio.load(body)
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

          // let detailsUrl = baseUrl + 'chargerDetailPaiements&'
          // detailsUrl += `idPaiement=${idPaiement}&`
          // detailsUrl += `naturePaiement=${naturePaiement}&`
          // detailsUrl += `indexGroupe=${indexGroupe}&`
          // detailsUrl += `indexPaiement=${indexPaiement}`
          // console.log('IT WORKS 2 ', detailsUrl)
          const detailsUrl = `${baseUrl}chargerDetailPaiements\
&idPaiement=${idPaiement}\
&naturePaiement=${naturePaiement}\
&indexGroupe=${indexGroupe}\
&indexPaiement=${indexPaiement}`
          console.log('IT WORKS 2? ', detailsUrl)

          let lineId = indexGroupe + indexPaiement

          let bill = {
            amount,
            type: 'health',
            subtype: label,
            date,
            vendor: 'Ameli',
            lineId,
            detailsUrl
          }

          if (bill.amount != null) { return healthBills.fetched.push(bill) }
        })
      })

      return async.each(healthBills.fetched, getPdf, err => next(err))
    }
  })
}

const getPdf = function (bill, callback) {
  // Request the generated url to get the detailed pdf
  let detailsOptions = {
    jar: true,
    strictSSL: false,
    url: bill.detailsUrl
  }

  return request(detailsOptions, function (err, res, body) {
    if (err) {
      log.error(err)
      return callback('request error')
    } else {
      let $ = cheerio.load(body)

      let pdfUrl = $(`[id=liendowndecompte${bill.lineId}]`).attr('href')
      if (pdfUrl) {
        pdfUrl = `https://assure.ameli.fr${pdfUrl}`
        bill.pdfurl = pdfUrl
        return callback(null)
      }
    }
  })
}

let buildNotification = function (requiredFields, healthBills, data, next) {
  log.info('Import finished')
  let notifContent = null
  if (healthBills && healthBills.filtered && healthBills.filtered.length) {
    // let localizationKey = 'notification ameli'
    let options = {smart_count: healthBills.filtered.length}
    // healthBills.notifContent = localization.t(localizationKey, options)
  }

  return next()
}

let customLinkBankOperation = function (requiredFields, healthBills, data, next) {
  let identifier = 'C.P.A.M.'
  let bankIdentifier = requiredFields.bank_identifier
  if ((bankIdentifier != null) && (bankIdentifier !== '')) { identifier = bankIdentifier }

  return linkBankOperation({
    log,
    model: Bill,
    identifier,
    dateDelta: 10,
    amountDelta: 0.1
  })(requiredFields, healthBills, data, next)
}

let fileOptions = {
  vendor: 'ameli',
  dateFormat: 'YYYYMMDD'
}

module.exports = baseKonnector.createNew({

  name: 'Ameli',
  vendorLink: 'http://www.ameli.fr/',

  category: 'health',
  color: {
    hex: '#0062AE',
    css: '#0062AE'
  },

  fields: {
    login: {
      type: 'text'
    },
    password: {
      type: 'password'
    },
    bank_identifier: {
      type: 'text'
    },
    folderPath: {
      type: 'folder',
      advanced: true
    }
  },

  dataType: [
    'refund'
  ],

  models: [Bill],

  fetchOperations: [
    checkLogin,
    logIn,
    parsePage,
    filterExisting(log, Bill),
    saveDataAndFile(log, Bill, fileOptions, ['health', 'bill'])
    // customLinkBankOperation,
    // buildNotification
  ]})
