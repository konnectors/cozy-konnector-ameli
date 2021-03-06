class UrlService {
  constructor() {
    this.domain = 'https://assure.ameli.fr'

    this.baseUrl = `${this.domain}/PortailAS/paiements.do?actionEvt=`
    this.loginUrl = `${this.domain}/PortailAS/appmanager/PortailAS/assure?_nfpb=true&_pageLabel=as_login_page&connexioncompte_2actionEvt=afficher`

    this.submitUrl = `${this.domain}/PortailAS/appmanager/PortailAS/assure?_nfpb=true&_windowLabel=connexioncompte_2&connexioncompte_2_actionOverride=/portlets/connexioncompte/validationconnexioncompte&_pageLabel=as_login_page`
    this.reimbursementUrl = `${this.domain}/PortailAS/appmanager/PortailAS/assure?_nfpb=true&_pageLabel=as_paiements_page`
    this.infosUrl = `${this.domain}/PortailAS/appmanager/PortailAS/assure?_nfpb=true&_pageLabel=as_info_perso_page`
    this.messagesUrl = `${this.domain}/PortailAS/appmanager/PortailAS/assure?_nfpb=true&_pageLabel=as_messages_recus_page`
    this.attestationUrl = `${this.domain}/PortailAS/appmanager/PortailAS/assure?_nfpb=true&_windowLabel=attDroitsAccueil&attDroitsAccueil_actionOverride=/portlets/accueil/attdroits&_pageLabel=as_accueil_page`
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
