class UrlService {
  constructor () {
    const domain = 'https://assure.ameli.fr'

    this.baseUrl = `${domain}/PortailAS/paiements.do?actionEvt=`
    this.loginUrl = `${domain}/PortailAS/appmanager/PortailAS/assure?_somtc=true`
    this.submitUrl = `${domain}/PortailAS/appmanager/PortailAS/` +
      `assure?_nfpb=true&_windowLabel=connexioncompte_2&connexioncompte_2_` +
      `actionOverride=/portlets/connexioncompte/validationconnexioncompte&_pageLabel=as_login_page`
    this.reimbursementUrl = `${domain}/PortailAS/appmanager/PortailAS/assure?_nfpb=true&_pageLabel=as_paiements_page`
  }

  getBaseUrl () {
    return this.baseUrl
  }

  getLoginUrl () {
    return this.loginUrl
  }

  getSubmitUrl () {
    return this.submitUrl
  }

  getReimbursementUrl () {
    return this.reimbursementUrl
  }

  /**
   * @param endDate: a moment date
   */
  getBillUrl (endDate, monthsBack) {
    const startDate = endDate.subtract(monthsBack, 'months').format('DD/MM/YYYY')
    return `${this.getBaseUrl()}afficherPaiementsComplementaires&DateDebut=${startDate}&DateFin=${endDate}\
&Beneficiaire=tout_selectionner&afficherReleves=false&afficherIJ=false&afficherInva=false&afficherRentes=false\
&afficherRS=false&indexPaiement=&idNotif=`
  }

  getDetailsUrl (idPaiement, naturePaiement, indexGroupe, indexPaiement) {
    return `${this.getBaseUrl()}chargerDetailPaiements\
&idPaiement=${idPaiement}\
&naturePaiement=${naturePaiement}\
&indexGroupe=${indexGroupe}\
&indexPaiement=${indexPaiement}`
  }
}

module.exports = new UrlService()
