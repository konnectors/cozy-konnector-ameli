"use strict";

// Force sentry DSN into environment variables
// In the future, will be set by the stack
process.env.SENTRY_DSN =
  process.env.SENTRY_DSN ||
  "https://ae2447d6c4544985ae50a03520a06f89:5371dd68dfea408bbd9fbc8c97a9309a@sentry.cozycloud.cc/14";

const {
  log,
  BaseKonnector,
  saveBills,
  requestFactory,
  scrape
} = require("cozy-konnector-libs");
const moment = require("moment");
const sortBy = require("lodash/sortBy");
moment.locale("fr");
const bluebird = require("bluebird");
const Bill = require("./bill");

const urlService = require("./urlService");

let request = requestFactory({
  // debug: true,
  cheerio: true,
  json: false,
  jar: true
});

module.exports = new BaseKonnector(function fetch(fields) {
  return checkLogin(fields)
    .then(() => logIn(fields))
    .then($ => fetchMainPage($))
    .then($ => parseMainPage($))
    .then(reimbursements => getBills(reimbursements))
    .then(entries => {
      // get custom bank identifier if any
      let identifiers = ["c.p.a.m.", "caisse", "cpam", "ameli"];
      if (fields.bank_identifier && fields.bank_identifier.length) {
        identifiers = fields.bank_identifier;
      }

      return saveBills(entries, fields.folderPath, {
        timeout: Date.now() + 60 * 1000,
        identifiers,
        dateDelta: 10,
        amountDelta: 0.1
      });
    });
});

const checkLogin = function(fields) {
  log("info", "Checking the length of the login");
  if (fields.login.length > 13) {
    // remove the key from the social security number
    fields.login = fields.login.substr(0, 13);
    log("debug", `Fixed the login length to 13`);
  }

  return Promise.resolve();
};

function fetchLogin() {
  return request({
    url: urlService.getLoginUrl(),
    resolveWithFullResponse: true
  });
}

function submitForm(form) {
  return request({
    method: "POST",
    form,
    url: urlService.getSubmitUrl()
  });
}

// Procedure to login to Ameli website.
const logIn = function(fields) {
  log("info", "Now logging in");

  const form = {
    connexioncompte_2numSecuriteSociale: fields.login,
    connexioncompte_2codeConfidentiel: fields.password,
    connexioncompte_2actionEvt: "connecter",
    submit: "Valider"
  };

  return (
    // First request to get the cookie
    fetchLogin()
      .then(() => submitForm(form))
      .then($ => {
        const $errors = $("#r_errors");
        if ($errors.length > 0) {
          log("debug", $errors.text(), "These errors where found on screen");
          throw new Error("LOGIN_FAILED");
        }

        // The user must validate the CGU form
        const $cgu = $("meta[http-equiv=refresh]");
        if (
          $cgu.length > 0 &&
          $cgu.attr("content").includes("as_conditions_generales_page")
        ) {
          log("debug", $cgu.attr("content"));
          throw new Error("USER_ACTION_NEEDED");
        }

        // Default case. Something unexpected went wrong after the login
        if ($('[title="Déconnexion du compte ameli"]').length !== 1) {
          log(
            "debug",
            $("body").html(),
            "No deconnection link found in the html"
          );
          log("debug", "Something unexpected went wrong after the login");
          if ($(".centrepage h2")) {
            log(
              "error",
              $(".centrepage h2")
                .text()
                .trim()
            );
            throw new Error("VENDOR_DOWN");
          }
          throw new Error("LOGIN_FAILED");
        }

        log("info", "Correctly logged in");
        return request(urlService.getReimbursementUrl());
      })
  );
};

// fetch the HTML page with the list of health cares
const fetchMainPage = function($) {
  log("info", "Fetching the list of bills");

  // Get end date to generate the bill's url
  const endDate = moment($("#paiements_1dateFin").attr("value"), "DD/MM/YYYY");

  // We can get the history only 6 months back
  const billUrl = urlService.getBillUrl(endDate, 6);

  return request(billUrl);
};

const parseDetailsOnClick = onClick => {
  const tokens = onClick.split("'");

  const idPaiement = tokens[1];
  const naturePaiement = tokens[3];
  const indexGroupe = tokens[5];
  const indexPaiement = tokens[7];
  const lineId = indexGroupe + indexPaiement;

  return {
    idPaiement,
    naturePaiement,
    indexGroupe,
    indexPaiement,
    lineId,
    url: urlService.getDetailsUrl(
      idPaiement,
      naturePaiement,
      indexGroupe,
      indexPaiement
    )
  };
};

// Parse the fetched page to extract bill data.
const parseMainPage = function($) {
  let reimbursements = [];

  // Each bloc represents a month that includes 0 to n reimbursement
  const months = $(".blocParMois");
  months.each(function(monthNumber) {
    const $this = $(this);

    // It would be too easy to get the full date at the same place
    const year = scrape($(this), {
      sel: ".rowdate .mois",
      parse: val => val.split(" ")[1]
    });

    const paiements = $this.find(`[id^=lignePaiement${monthNumber}]`);
    paiements.each(function() {
      const $this = $(this);
      const { link, day, month, groupAmount, detailsOnClickInfo } = scrape(
        $this,
        {
          day: {
            sel: ".col-date .jour",
            index: 0
          },
          month: {
            sel: ".col-date .mois",
            index: 0
          },
          groupAmount: {
            sel: ".col-montant span",
            index: 0,
            parse: parseAmount
          },
          // This link seems to not be present in every account
          link: {
            sel: ".downdetail",
            attr: "href"
          },
          detailsOnClickInfo: {
            attr: "onclick",
            parse: parseDetailsOnClick
          }
        }
      );

      const date = moment(`${day} ${month} ${year}`, "Do MMMM YYYY").toDate();

      reimbursements.push({
        date,
        lineId: detailsOnClickInfo.lineId,
        detailsUrl: detailsOnClickInfo.url,
        link,
        groupAmount,
        isThirdPartyPayer:
          detailsOnClickInfo.naturePaiement === "PAIEMENT_A_UN_TIERS",
        beneficiaries: {}
      });
    });
  });

  reimbursements = sortBy(reimbursements, x => +x.date);
  return bluebird
    .map(reimbursements, fetchReimbursementDetail, { concurrency: 10 })
    .then(() => reimbursements);
};

function fetchReimbursementDetail(reimbursement) {
  const msg = `Fetching details for ${reimbursement.date} ${
    reimbursement.groupAmount
  }`;
  log("info", msg);
  return request(reimbursement.detailsUrl).then($ =>
    parseDetails($, reimbursement)
  );
}

function parseDetails($, reimbursement) {
  let currentBeneficiary = null;

  // compatibility code since not every accounts have this kind of links
  if (reimbursement.link == null) {
    reimbursement.link = $(".entete [id^=liendowndecompte]").attr("href");
  }
  if (reimbursement.link == null) {
    log("error", "Download link not found");
    log("error", $(".entete").html());
  }
  $(".container:not(.entete)").each(function() {
    const $beneficiary = $(this).find("[id^=nomBeneficiaire]");
    if ($beneficiary.length > 0) {
      // a beneficiary container
      currentBeneficiary = $beneficiary.text().trim();
      return null;
    }

    // the next container is the list of treatments associated to the beneficiary
    if (currentBeneficiary) {
      parseTreatment($, this, currentBeneficiary, reimbursement);
      currentBeneficiary = null;
    } else {
      // there is some participation remaining for the whole reimbursement
      parseParticipation($, this, reimbursement);
    }
  });
}

function parseAmount(amount) {
  const f = parseFloat(amount.replace(" €", "").replace(",", "."));
  if (isNaN(f)) {
    log("warn", `Could not parse ${amount}`);
    return null;
  }
  return f;
}

function parseDate(date) {
  const momentDate = moment(date, "DD/MM/YYYY");
  return momentDate.isValid() ? momentDate.toDate() : null;
}

function parseTreatment($, container, beneficiary, reimbursement) {
  const rows = $(container).find("tr");
  rows.each(function() {
    const $this = $(this);
    if ($this.find("th").length > 0) {
      return null; // ignore header
    }

    const healthCare = scrape($this, {
      prestation: ".naturePrestation",
      date: {
        sel: "[id^=Nature]",
        fn: $node =>
          $node
            .html()
            .split("<br>")
            .pop()
            .trim(),
        parse: parseDate
      },
      montantPayé: {
        sel: "[id^=montantPaye]",
        parse: parseAmount
      },
      baseRemboursement: "[id^=baseRemboursement]",
      taux: "[id^=taux]",
      montantVersé: {
        sel: "[id^=montantVerse]",
        parse: parseAmount
      }
    });

    reimbursement.beneficiaries[beneficiary] =
      reimbursement.beneficiaries[beneficiary] || [];
    reimbursement.beneficiaries[beneficiary].push(healthCare);
  });
}

function parseParticipation($, container, reimbursement) {
  const rows = $(container).find("tr");
  rows.each(function() {
    const $this = $(this);
    if ($this.find("th").length > 0) {
      return null; // ignore header
    }

    if (reimbursement.participation) {
      log(
        "warning",
        "There is already a participation, this case is not supposed to happend"
      );
    }
    reimbursement.participation = scrape($this, {
      prestation: "[id^=naturePFF]",
      date: {
        sel: "[id^=dateActePFF]",
        parse: parseDate
      },
      montantVersé: {
        sel: "[id^=montantVerse]",
        parse: parseAmount
      }
    });
  });
}

function getBills(reimbursements) {
  const bills = [];
  reimbursements.forEach(reimbursement => {
    for (const beneficiary in reimbursement.beneficiaries) {
      reimbursement.beneficiaries[beneficiary].forEach(healthCare => {
        bills.push(
          new Bill({
            type: "health",
            subtype: healthCare.prestation,
            beneficiary,
            isThirdPartyPayer: reimbursement.isThirdPartyPayer,
            date: reimbursement.date,
            originalDate: healthCare.date,
            vendor: "Ameli",
            isRefund: true,
            amount: healthCare.montantVersé,
            originalAmount: healthCare.montantPayé,
            fileurl: "https://assure.ameli.fr" + reimbursement.link,
            filename: getFileName(reimbursement.date),
            groupAmount: reimbursement.groupAmount
          })
        );
      });
    }

    if (reimbursement.participation) {
      bills.push(
        new Bill({
          type: "health",
          subtype: reimbursement.participation.prestation,
          isThirdPartyPayer: reimbursement.isThirdPartyPayer,
          date: reimbursement.date,
          originalDate: reimbursement.participation.date,
          vendor: "Ameli",
          isRefund: true,
          amount: reimbursement.participation.montantVersé,
          fileurl: "https://assure.ameli.fr" + reimbursement.link,
          filename: getFileName(reimbursement.date),
          groupAmount: reimbursement.groupAmount
        })
      );
    }
  });
  return bills.filter(bill => !isNaN(bill.amount));
}

function getFileName(date) {
  return `${moment(date).format("YYYYMMDD")}_ameli.pdf`;
}
