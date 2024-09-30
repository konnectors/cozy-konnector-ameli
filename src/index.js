import SuperContentScript from './SuperContentScript'
import fr from 'date-fns/locale/fr'
import { parse, format } from 'date-fns'

const baseUrl = 'https://assure.ameli.fr'
const infoUrl =
  baseUrl +
  '/PortailAS/appmanager/PortailAS/assure?_nfpb=true&_pageLabel=as_info_perso_book'
const paiementsUrl =
  baseUrl +
  '/PortailAS/appmanager/PortailAS/assure?_nfpb=true&_pageLabel=as_paiements_page'

const paiementsRequestUrl =
  baseUrl + '/PortailAS/paiements.do?actionEvt=afficherPaiementsComplementaires'

const messagesUrl =
  baseUrl +
  '/PortailAS/appmanager/PortailAS/assure?_nfpb=true&_pageLabel=as_messages_recus_page'

class AmeliContentScript extends SuperContentScript {
  // ////////
  // PILOT //
  // ////////
  async ensureAuthenticated({ account }) {
    this.launcher.log('info', '🤖 ensureAuthenticated starts')

    if (!account) {
      await this.ensureNotAuthenticated()
    }
    await this.page.goto(baseUrl)
    await this.page
      .getByCss('.deconnexionButton, #connexioncompte_2nir_as')
      .waitFor()

    const authenticated = await this.page.evaluate(checkAuthenticated)
    if (!authenticated) {
      await this.waitForUserAuthentication()
    }
  }

  async ensureNotAuthenticated() {
    this.launcher.log('info', '🤖 ensureNotAuthenticated starts')
    await this.page.goto(baseUrl)
    await this.page
      .getByCss('.deconnexionButton, #connexioncompte_2nir_as')
      .waitFor()
    const authenticated = await this.page.evaluate(checkAuthenticated)
    if (!authenticated) {
      return true
    }

    this.launcher.log('info', 'User authenticated. Logging out')
    await this.page.getByCss('.deconnexionButton').click()
    await this.page.getByCss('#as_deconnexion_page').waitFor()
    return true
  }

  async getUserDataFromWebsite() {
    this.launcher.log('info', '🤖 getUserDataFromWebsite starts')
    await this.page.goto(infoUrl)

    const sourceAccountIdentifier = (
      await this.page.getByCss('.blocNumSecu').innerHTML()
    )
      .trim()
      .split(' ')
      .join('')

    if (sourceAccountIdentifier) {
      return {
        sourceAccountIdentifier
      }
    } else {
      throw new Error(
        'No sourceAccountIdentifier, the konnector should be fixed'
      )
    }
  }

  async waitForUserAuthentication() {
    this.launcher.log('info', 'waitForUserAuthentication starts')
    await this.page.show()
    await this.page.waitFor(checkAuthenticated)
    await this.page.hide()
  }

  async fetch(context) {
    await this.fetchAttestation(context)
    const reimbursements = await this.fetchBills()
    const entries = await getHealthCareBills(reimbursements)

    // first save files, then update existingFilesIndex
    // to avoid multiple files downloads for the same file
    const fileEntries = Object.values(
      entries.reduce((memo, entry) => {
        if (!memo[entry.vendorRef]) {
          memo[entry.vendorRef] = entry
        }
        return memo
      }, {})
    )
    await this.saveFiles(fileEntries, {
      context,
      fileIdAttributes: ['vendorRef'],
      contentType: 'application/pdf'
    })
    await this.saveBills(entries, {
      context,
      fileIdAttributes: ['vendorRef'],
      contentType: 'application/pdf',
      keys: ['vendorRef', 'date', 'amount', 'beneficiary', 'subtype', 'index']
    })

    const messages = await this.fetchMessages()
    await this.saveFiles(messages, {
      context,
      fileIdAttributes: ['vendorRef'],
      contentType: 'application/pdf'
    })
  }

  async fetchMessages() {
    await this.page.goto(messagesUrl)
    await this.page.getByCss('#tableauMessagesRecus tbody tr').waitFor()

    const docs = await this.page.evaluate(function parseMessages() {
      const docs = []
      const trs = document.querySelectorAll('#tableauMessagesRecus tbody tr')
      for (const tr of trs) {
        docs.push({
          vendorRef: tr.querySelector('td:nth-child(1) input')?.value,
          from: tr.querySelector('td:nth-child(3)')?.innerText.trim(),
          title: tr.querySelector('td:nth-child(4)')?.innerText.trim(),
          date: tr.querySelector('td:nth-child(5)')?.innerText.trim(),
          detailsLink: tr
            .querySelector('td:nth-child(5) a')
            ?.getAttribute('href')
        })
      }
      return docs
    })

    const tokenResponse = await this.page.fetch(
      'https://assure.ameli.fr/PortailAS/JavaScriptServlet',
      {
        method: 'POST',
        headers: {
          'FETCH-CSRF-TOKEN': '1'
        },
        serialization: 'text'
      }
    )
    const csrfToken = tokenResponse.split(':').pop()
    const piecesJointes = []
    for (const doc of docs) {
      const html = await this.page.fetch(doc.detailsLink, {
        serialization: 'text'
      })
      document.body.innerHTML = html
      const form = document.querySelector('#pdfSimple')
      doc.date = parse(doc.date, 'dd/MM/yy', new Date())
      const hash = await this.page.evaluate(hexDigest, doc.vendorRef)
      const fileprefix = `${format(
        doc.date,
        'yyyMMdd',
        new Date()
      )}_ameli_message_${doc.title}_${hash.substr(0, 5)}`

      const fileurl = baseUrl + form.getAttribute('action')

      Object.assign(doc, {
        fileurl: fileurl + `?_ct=${csrfToken}`,
        requestOptions: {
          method: 'POST',
          form: {
            idMessage: form.querySelector(`[name='idMessage']`).value,
            telechargementPDF: form.querySelector(`[name='telechargementPDF']`)
              .value,
            nomPDF: form.querySelector(`[name='nomPDF']`).value
          }
        },
        filename: `${fileprefix}.pdf`,
        fileAttributes: {
          metadata: {
            carbonCopy: true
          }
        }
      })

      const pj = document.querySelector('.telechargement_PJ')
      if (pj) {
        piecesJointes.push({
          fileurl: baseUrl + pj.getAttribute('href') + `?_ct=${csrfToken}`,
          filename: fileprefix + '_PJ.pdf',
          vendorRef: doc.vendorRef + '_PJ',
          fileAttributes: {
            metadata: {
              carbonCopy: true
            }
          }
        })
      }
    }
    return [...docs, ...piecesJointes]
  }

  async fetchBills() {
    await this.page.goto(paiementsUrl)

    const tokenResponse = await this.page.fetch(
      'https://assure.ameli.fr/PortailAS/JavaScriptServlet',
      {
        method: 'POST',
        headers: {
          'FETCH-CSRF-TOKEN': '1'
        },
        serialization: 'text'
      }
    )
    const csrfToken = tokenResponse.split(':').pop()

    await this.page.getByCss('.boutonLigne').waitFor()
    const dates = await this.page.evaluate(function fetchDates() {
      const debut = document
        .querySelector('#paiements_1dateDebut')
        .getAttribute('data-mindate')
      const fin = document
        .querySelector('#paiements_1dateFin')
        .getAttribute('data-maxdate')
      return { debut, fin }
    })
    const paiementsResponse = await this.page.fetch(
      paiementsRequestUrl +
        `&idNoCache=${Date.now()}&DateDebut=${dates.debut}&DateFin=${
          dates.fin
        }&Beneficiaire=tout_selectionner&afficherIJ=true&afficherPT=false&afficherInva=false&afficherRentes=false&afficherRS=false&indexPaiement=&idNotif=`,
      {
        headers: {
          _ct: csrfToken
        },
        serialization: 'json'
      }
    )
    document.body.innerHTML = paiementsResponse.tableauPaiement
    const reimbursements = Array.from(
      document.querySelectorAll('.blocParMois')
    ).reduce(parseBloc, [])
    reimbursements.sort((a, b) => (+a.date > +b.date ? -1 : 1)) // newest first

    for (const reimbursement of reimbursements) {
      const detailsHtml = await this.page.fetch(reimbursement.detailsUrl, {
        headers: {
          _ct: csrfToken
        },
        serialization: 'text'
      })
      parseDetails(detailsHtml, reimbursement)
    }
    return reimbursements
  }

  // async fetchAttestation(context) {
  //   await this.page.goto(baseUrl)
  //   const interception = await this.waitForRequestInterception(
  //     'javascriptServlet'
  //   )
  //   const csrfToken = interception.response.split(':').pop()

  //   const attestationUrl = `${baseUrl}/PortailAS/appmanager/PortailAS/assure?_nfpb=true&_windowLabel=attDroitsAccueil&attDroitsAccueil_actionOverride=/portlets/accueil/attdroits&_pageLabel=as_accueil_page&${csrfToken}`

  //   const searchParams = new URLSearchParams()
  //   searchParams.set('attDroitsAccueilidBeneficiaire', 'FAMILLE')
  //   searchParams.set('attDroitsAccueilmentionsComplementaires', 'ETM')
  //   searchParams.set('attDroitsAccueilmentionsComplementaires', 'confirmer')
  //   searchParams.set('attDroitsAccueilblocOuvert', true)
  //   searchParams.set('_ct', csrfToken)

  //   const html = await ky
  //     .post(attestationUrl, {
  //       body: searchParams
  //     })
  //     .text()
  //   // const body = new FormData()
  //   // body.set('attDroitsAccueilidBeneficiaire', 'FAMILLE')
  //   // body.set('attDroitsAccueilmentionsComplementaires', 'ETM')
  //   // body.set('attDroitsAccueilmentionsComplementaires', 'confirmer')
  //   // body.set('attDroitsAccueilblocOuvert', true)
  //   // body.set('_ct', csrfToken)
  //   // const response = await fetch(attestationUrl, {
  //   //   method: 'POST',
  //   //   body
  //   // })
  //   // const html = await response.text()
  //   throw new Error('fetchAttestation normal error')

  //   // const $link = $('.r_lien_pdf')
  //   // if ($link.length) {
  //   // return urlService.getDomain() + $link.attr('href')
  //   // }

  //   // await this.page
  //   //   .getByCss('#attDroitsAccueilidBenefs')
  //   //   .evaluate(function selectFamille($combo) {
  //   //     $combo.value = 'FAMILLE'
  //   //   })

  //   // await this.page
  //   //   .getByCss('#attDroitsAccueilattDroitsForm')
  //   //   .evaluate(function submitForm($form) {
  //   //     $form.submit()
  //   //   })
  //   // const attestationUrl =
  //   //   baseUrl + (await this.page.getByCss('.r_lien_pdf').getAttribute('href'))
  //   // console.log('🐛🐛🐛 attestationUrl', attestationUrl)
  //   // console.log('🐛🐛🐛 done')
  //   // throw new Error('fetchAttestation normal error')
  // }

  // ////////
  // WORKER//
  // ////////
}

const connector = new AmeliContentScript({})
connector
  .init({
    additionalExposedMethodsNames: ['runLocator', 'workerWaitFor']
  })
  .catch(err => {
    console.warn(err)
  })

function checkAuthenticated() {
  return Boolean(document.querySelector('.deconnexionButton'))
}

function parseAmount(amount) {
  let result = parseFloat(amount.replace(' €', '').replace(',', '.'))
  if (isNaN(result)) result = 0
  return result
}

function parseBloc(memo, bloc) {
  const year = bloc.querySelector('.rowdate .mois').innerText.split(' ').pop()
  const reimbursements = Array.from(
    bloc.querySelectorAll('[id*=lignePaiement]')
  ).map(ligne => {
    const month = ligne.querySelector('.col-date .mois').innerText.trim()
    const day = ligne.querySelector('.col-date .jour').innerText.trim()
    const groupAmount = parseAmount(
      ligne.querySelector('.col-montant span').innerText.trim()
    )
    const dateString = `${day} ${month} ${year}`
    const date = parse(dateString, 'dd MMM yyyy', new Date(), { locale: fr })

    const tokens = ligne.getAttribute('onclick').split("'")
    const idPaiement = tokens[1]
    const naturePaiement = tokens[3]
    const indexGroupe = tokens[5]
    const indexPaiement = tokens[7]

    const detailsUrl = `${baseUrl}/PortailAS/paiements.do?actionEvt=chargerDetailPaiements\
&idPaiement=${idPaiement}\
&naturePaiement=${naturePaiement}\
&indexGroupe=${indexGroupe}\
&indexPaiement=${indexPaiement}\
&idNoCache=${Date.now()}`

    let link = ligne.querySelector('.downdetail').getAttribute('href')
    if (!link) {
      link = ligne.querySelector('[id*=liendowndecompte]').getAttribute('href')
    }
    const lineId = indexGroupe + indexPaiement
    return {
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
  })
  return [...memo, ...reimbursements]
}

function parseDetails(html, reimbursement) {
  if (
    reimbursement.naturePaiement === 'PAIEMENT_A_UN_TIERS' ||
    reimbursement.naturePaiement === 'REMBOURSEMENT_SOINS'
  ) {
    return parseSoinDetails(html, reimbursement)
  } else if (reimbursement.naturePaiement === 'INDEMNITE_JOURNALIERE_ASSURE') {
    return parseIndemniteJournaliere(html, reimbursement)
  }
}

function parseSoinDetails(html, reimbursement) {
  document.body.innerHTML = html
  let currentBeneficiary = null

  if (reimbursement.link == null) {
    reimbursement.link = document
      .querySelector('.entete [id^=liendowndecompte]')
      .getAttribute('href')
  }
  const containers = Array.from(
    document.querySelectorAll('.container:not(.entete)')
  )
  for (const container of containers) {
    const beneficiary = container.querySelector('[id^=nomBeneficiaire]')
    if (beneficiary) {
      currentBeneficiary = beneficiary.innerText.trim()
      continue
    }

    if (currentBeneficiary) {
      const trs = container.querySelectorAll('tr')
      let index = 0
      for (const tr of trs) {
        index++
        if (tr.querySelector('th')) continue

        let date = tr
          .querySelector('[id^=Nature]')
          ?.innerHTML.split('<br>')
          ?.pop()
          ?.trim()

        date = date ? parse(date, 'dd/MM/yyyy', new Date()) : undefined

        const prestation = tr
          .querySelector('.naturePrestation')
          ?.innerText.trim()
        const montantPayé = parseAmount(
          tr.querySelector('[id^=montantPaye]')?.innerText.trim()
        )
        const baseRemboursement = parseAmount(
          tr.querySelector('[id^=baseRemboursement]')?.innerText.trim()
        )
        const taux = tr.querySelector('[id^=taux]')?.innerText.trim()
        const montantVersé = parseAmount(
          tr.querySelector('[id^=montantVerse]')?.innerText.trim()
        )
        const healthCare = {
          index,
          prestation,
          date,
          montantPayé,
          baseRemboursement,
          taux,
          montantVersé
        }
        reimbursement.beneficiaries[currentBeneficiary] =
          reimbursement.beneficiaries[currentBeneficiary] || []
        reimbursement.beneficiaries[currentBeneficiary].push(healthCare)
      }
      currentBeneficiary = null
    } else {
      const trs = container.querySelectorAll('tr')
      for (const tr of trs) {
        if (tr.querySelector('th')) {
          continue
        }

        let date = tr.querySelector('[id^=dateActePFF]').innerText.trim()
        date = date ? parse(date, 'dd/MM/yyyy', new Date()) : undefined
        reimbursement.participation = {
          prestation: tr.querySelector('[id^=naturePFF]').innerText.trim(),
          date,
          montantVersé: parseAmount(
            tr.querySelector('[id^=montantVerse]').innerText.trim()
          )
        }
      }
    }
  }
}

function parseIndemniteJournaliere(html, reimbursement) {
  document.body.innerHTML = html
  const parsed = document
    .querySelector('detailpaiement > div > h2')
    .innerText.match(/Paiement effectué le (.*) pour un montant de (.*) €/)

  if (parsed) {
    const [date, amount] = parsed.slice(1, 3)
    Object.assign(reimbursement, {
      date: parse(date, 'dd/MM/YYYY', new Date()),
      amount: parseAmount(amount)
    })
  }
  return reimbursement
}
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function getHealthCareBills(reimbursements) {
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
            date: reimbursement.date,
            vendor: 'Ameli',
            isRefund: true,
            amount: healthCare.montantVersé,
            originalAmount: healthCare.montantPayé,
            fileurl: baseUrl + reimbursement.link,
            vendorRef: reimbursement.idPaiement,
            filename: getFileName(reimbursement),
            fileAttributes: {
              metadata: {
                carbonCopy: true,
                qualificationLabel: 'health_invoice',
                datetime: reimbursement.date,
                datetimeLabel: 'issueDate',
                issueDate: reimbursement.date
              }
            },
            groupAmount: reimbursement.groupAmount
          }
          if (healthCare.date) {
            newbill.originalDate = healthCare.date
          }
          bills.push(newbill)
        })
      }

      if (reimbursement.participation) {
        const newbill = {
          type: 'health',
          subtype: reimbursement.participation.prestation,
          isThirdPartyPayer: reimbursement.isThirdPartyPayer,
          date: reimbursement.date,
          vendor: 'Ameli',
          isRefund: true,
          amount: reimbursement.participation.montantVersé,
          fileurl: baseUrl + reimbursement.link,
          vendorRef: reimbursement.idPaiement,
          filename: getFileName(reimbursement),
          fileAttributes: {
            metadata: {
              qualificationLabel: 'health_invoice',
              datetime: reimbursement.date,
              datetimeLabel: 'issueDate',
              issueDate: reimbursement.date
            }
          },
          groupAmount: reimbursement.groupAmount
        }
        if (reimbursement.participation.date) {
          newbill.originalDate = reimbursement.participation.date
        }
        bills.push(newbill)
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
  return `${format(reimbursement.date, 'yyyyMMdd')}_ameli${
    nature ? '_' + nature : ''
  }${amount ? '_' + amount.toFixed(2) + 'EUR' : ''}.pdf`
}

async function hexDigest(message) {
  const msgUint8 = new TextEncoder().encode(message) // encode as (utf-8) Uint8Array
  const hashBuffer = await window.crypto.subtle.digest('SHA-1', msgUint8) // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer)) // convert buffer to byte array
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('') // convert bytes to hex string
  return hashHex
}
