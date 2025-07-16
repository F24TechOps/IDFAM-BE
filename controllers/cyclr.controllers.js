const {
  fetchCyclrAccounts,
  fetchCyclrAccount,
  fetchCyclrAccountByCyclrID,
} = require("../models/cyclr.models");

exports.getCyclrAccounts = (req, res, next) => {
  fetchCyclrAccounts()
    .then((cyclrResponse) => {
      return res.status(200).send({
        success: true,
        accounts: cyclrResponse.data,
      });
    })
    .catch(next);
};

exports.getCyclrAccount = (req, res, next) => {
  const { accountid, accountName } = req.params;
  fetchCyclrAccount(accountid, accountName)
    .then((cyclrRes) => {
      return res.status(200).send({ data: cyclrRes.data });
    })
    .catch(next);
};

exports.getCyclrAccountByCyclrID = (req, res, next) => {
  const { cyclrName, force24Id } = req.params;

  console.log(`→ Processing: ${cyclrName} / ${force24Id}`);

  const cyclrId = cyclrJson.find(
    (account) => account["Cyclr Name"] === cyclrName
  )?.["Cyclr Id"];

  if (!cyclrId) {
    console.log(`✖️ Failed: ${cyclrName} not found in cyclrJson`);
    return res
      .status(400)
      .json({ error: `Cyclr Name "${cyclrName}" not found.` });
  }

  fetchCyclrAccountByCyclrID(cyclrName, force24Id).then((response) => {
    res.status(200).json(response.data);
  });
};
