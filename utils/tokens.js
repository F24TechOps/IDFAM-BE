const axios = require("axios");
require("dotenv").config();
const qs = require("qs");

exports.fetchCyclrToken = async () => {
  try {
    const token = await axios.post(
      "https://apiintegrations.force24.co.uk/oauth/token",
      qs.stringify({
        grant_type: "client_credentials",
        client_id: `${process.env.CYCLR_API_ID}`,
        client_secret: `${process.env.CYCLR_API_SECRET}`,
      })
    );

    const cyclrAccessToken = token.data.access_token;
    return cyclrAccessToken
  } catch (err) {
    console.log(err);
  }
}