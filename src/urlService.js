class UrlService {
  constructor() {
    this.domain = 'https://assure.ameli.fr'

    this.baseUrl = `${this.domain}/PortailAS/paiements.do?actionEvt=`
    this.loginUrl = `${this.domain}/PortailAS/appmanager/PortailAS/assure?_nfpb=true&_pageLabel=as_login_page&connexioncompte_2actionEvt=afficher`

    this.submitUrl = `${this.domain}/PortailAS/appmanager/PortailAS/assure`
    this.reimbursementUrl = `${this.domain}/PortailAS/appmanager/PortailAS/assure?_nfpb=true&_pageLabel=as_paiements_page`
    this.infosUrl = `${this.domain}/PortailAS/appmanager/PortailAS/assure?_nfpb=true&_pageLabel=as_info_perso_page`
    this.messagesUrl = `${this.domain}/PortailAS/appmanager/PortailAS/assure?_nfpb=true&_pageLabel=as_messages_recus_page`
    this.attestationUrl = `${this.domain}/PortailAS/appmanager/PortailAS/assure?_nfpb=true&_windowLabel=attDroitsAccueil&attDroitsAccueil_actionOverride=/portlets/accueil/attdroits&_pageLabel=as_accueil_page`
    this.alternativeLoginUrl = `${this.domain}/PortailAS/appmanager/PortailAS/assure?_somtc=true`
    // this.fanceConnectLoginUrl = `${this.domain}
  }

  setCsrf(csrf) {
    this.csrf = csrf
  }

  getCsrf() {
    return this.csrf
  }

  getDomain() {
    return this.domain
  }

  getBaseUrl() {
    return this.baseUrl
  }

  getLoginUrl() {
    return this.loginUrl
  }

  getSubmitUrl() {
    return this.submitUrl
  }

  getReimbursementUrl() {
    return this.reimbursementUrl
  }

  getInfosUrl() {
    return this.infosUrl
  }

  getMessagesUrl() {
    return this.messagesUrl
  }

  getAttestationUrl() {
    return this.attestationUrl + '&' + this.getCsrf()
  }

  getAlternativeLoginUrl() {
    return this.alternativeLoginUrl
  }

  getFranceConnectUrl() {
    return this.fanceConnectLoginUrl
  }

  getBillUrl() {
    const action =
      'afficherPaiementsComplementaires&' +
      'Beneficiaire=tout_selectionner&' +
      'afficherReleves=true&' +
      'afficherIJ=true&' +
      'afficherPT=false&' +
      'afficherInva=false&' +
      'afficherRentes=false&' +
      'afficherRS=false&' +
      'indexPaiement=&'
    return `${this.getBaseUrl()}${action}`
  }

  getDetailsUrl(idPaiement, naturePaiement, indexGroupe, indexPaiement) {
    return `${this.getBaseUrl()}chargerDetailPaiements\
&idPaiement=${idPaiement}\
&naturePaiement=${naturePaiement}\
&indexGroupe=${indexGroupe}\
&indexPaiement=${indexPaiement}\
&idNoCache=${Date.now()}`
  }
}

module.exports = new UrlService()

// Url france connect from ameli website
// https://app.franceconnect.gouv.fr/api/v1/authorize?state=26a2e9790050f&scope=openid+identite_pivot&response_type=code&redirect_uri=https%3A%2F%2Fassure.ameli.fr%3A443%2FPortailAS%2FFranceConnect%2Fcb%3FredirectUrlFc%3D%252FPortailAS%252FFranceConnect&nonce=2a0df43c9df99&client_id=cb56182576e9435bae57d8044a666ad1df32127a61082a3ed6130c52f191f1b7

// franceConnectLogin page
// https://fc.assure.ameli.fr/FRCO-app/login
