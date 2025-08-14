const axios = require("axios");
require("dotenv").config();
const qs = require("qs");
const { fetchCyclrToken } = require("../utils/tokens");

exports.fetchCyclrAccounts = async () => {
  const cyclrAccessToken = await fetchCyclrToken()
  try {
    // Fetch CYCLR account
    const cyclrResponse = await axios.get(
      "https://apiintegrations.force24.co.uk/v1.0/accounts",
      {
        params: {
          pageSize: 1000,
          page: 1,
          sortOrderAsc: true,
        },
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${cyclrAccessToken}`,
        },
      }
    );
    return cyclrResponse;

    // console.log(JSON.stringify(cyclrResponse.data, null, 2));

    // const cyclrAccounts = cyclrResponse.data.map((account) => ({
    //   "Cyclr Id": account.Id,
    //   "Cyclr Name": account.Name,
    // }));

    // fs.writeFile(
    //   "./cyclr-accounts.json",
    //   JSON.stringify(cyclrAccounts),
    //   (err) => {
    //     if (err) {
    //       console.log("Error writing file:", err);
    //     } else {
    //       console.log("File has been written");
    //     }
    //   }
    // );
  } catch (error) {
    next(error);
  }
};

exports.fetchCyclrAccount = async (accountid) => {
  const cyclrAccessToken = await fetchCyclrToken()
  try {
    const cyclrRes = await axios.get(
      "https://apiintegrations.force24.co.uk/v1.0/account/connectors",
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${cyclrAccessToken}`,
          "X-Cyclr-Account": `${accountid}`,
        },
      }
    );

    return cyclrRes;

    // const clientId = cyclrRes.data
    //   .filter((item) => item.Name === "Force24 v2")[0]
    //   ?.Properties.filter((item) => item.Name === "ClientId")[0].Value;

    // const accObj = {
    //   "Client Id": clientId,
    //   "Cyclr Name": accountName,
    // };

    // if (!fs.existsSync('./clientId.json')) {
    //   fs.writeFileSync('./clientId.json', JSON.stringify([]));
    //   const initialData = [accObj];
    //   fs.writeFileSync('./clientId.json', JSON.stringify(initialData, null, 2));
    // } else {
    //   const existingData = JSON.parse(fs.readFileSync('./clientId.json', 'utf8'));
    //   existingData.push(accObj);
    //   fs.writeFileSync('./clientId.json', JSON.stringify(existingData, null, 2));
    // }
  } catch (err) {
    console.log(err);
  }
};

exports.fetchCyclrAccountByCyclrID = async () => {
  const cyclrAccessToken = fetchCyclrToken();

  try {
    const response = await axios.put(
      `https://apiintegrations.force24.co.uk/v1.0/accounts/${cyclrId}`,
      {
        Name: cyclrName,
        Description: `Platform ID: ${force24Id}`,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${cyclrAccessToken}`,
        },
      }
    );
    console.log(`✅ Success: ${cyclrName}`);
    return response;
  } catch (err) {
    // console.log(`❌ Error: ${cyclrName}`, err.response?.data || err.message);
    // res
    //   .status(err.response?.status || 500)
    //   .json({ error: err.message || "Unknown error" });
  }
};
