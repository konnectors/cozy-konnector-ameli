class UrlService {
  constructor() {
    const domain = "https://assure.ameli.fr";

    this.baseUrl = `${domain}/PortailAS/paiements.do?actionEvt=`;
    this.loginUrl = `${domain}/PortailAS/appmanager/PortailAS/assure?_somtc=true`;
    this.submitUrl =
      `${domain}/PortailAS/appmanager/PortailAS/` +
      `assure?_nfpb=true&_windowLabel=connexioncompte_2&connexioncompte_2_` +
      `actionOverride=/portlets/connexioncompte/validationconnexioncompte&_pageLabel=as_login_page`;
    this.reimbursementUrl = `${domain}/PortailAS/appmanager/PortailAS/assure?_nfpb=true&_pageLabel=as_paiements_page`;
  }

  getBaseUrl() {
    return this.baseUrl;
  }

  getLoginUrl() {
    return this.loginUrl;
  }

  getSubmitUrl() {
    return this.submitUrl;
  }

  getReimbursementUrl() {
    return this.reimbursementUrl;
  }

  getBillUrl() {
    const action =
      "afficherPaiementsComplementaires&" +
      "Beneficiaire=tout_selectionner&" +
      "afficherReleves=true&" +
      "afficherIJ=false&" +
      "afficherPT=false&" +
      "afficherInva=false&" +
      "afficherRentes=false&" +
      "afficherRS=false&" +
      "indexPaiement=&";
    return `${this.getBaseUrl()}${action}`;
  }

  getDetailsUrl(idPaiement, naturePaiement, indexGroupe, indexPaiement) {
    return `${this.getBaseUrl()}chargerDetailPaiements\
&idPaiement=${idPaiement}\
&naturePaiement=${naturePaiement}\
&indexGroupe=${indexGroupe}\
&indexPaiement=${indexPaiement}`;
  }
}

module.exports = new UrlService();
