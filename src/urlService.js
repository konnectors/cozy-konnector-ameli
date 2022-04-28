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
    this.franceConnectLoginUrl = `${this.domain}/PortailAS/FranceConnect`
    this.selectFCServiceUrl = `https://app.franceconnect.gouv.fr/call?provider=ameli&storeFI=1`
    this.submitFCLoginUrl = `https://fc.assure.ameli.fr/FRCO-app/j_spring_security_check`
    this.triggerFCRedirectUrl = `https://app.franceconnect.gouv.fr/confirm-redirect-client`
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
    return this.franceConnectLoginUrl
  }

  getSelectFCServiceUrl() {
    return this.selectFCServiceUrl
  }

  getSubmitFCLoginUrl() {
    return this.submitFCLoginUrl
  }

  getTriggerFCRedirectUrl() {
    return this.triggerFCRedirectUrl
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
