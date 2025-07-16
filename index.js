const express = require("express");
const { resolve } = require("path");
const { createClient } = require("@supabase/supabase-js");
const axios = require("axios");
const cron = require("node-cron");
require("dotenv").config();
const qs = require("qs");
const fs = require("fs");
const writeXlsxFile = require("write-excel-file/node");
const readXlsxFile = require("read-excel-file/node");
const cyclrJson = require("./cyclr-accounts.json");

const app = express();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

let cyclrAccessToken;
let force24AccessToken;

app.use(express.static("static"));
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(resolve(__dirname, "pages/index.html"));
});

// Fetch CYCLR token
app.get("/api/cyclr-token", async (req, res) => {
  try {
    const token = await axios.post(
      "https://apiintegrations.force24.co.uk/oauth/token",
      qs.stringify({
        grant_type: "client_credentials",
        client_id: `${process.env.CYCLR_API_ID}`,
        client_secret: `${process.env.CYCLR_API_SECRET}`,
      })
    );

    cyclrAccessToken = token.data.access_token;
    cyclrTokenType = token.data.token_type;
    cyclrExpiresIn = token.data.expires_in;

    return res.status(200).json({
      success: true,
      token: token.data.access_token,
      token_type: token.data.token_type,
      expires_in: token.data.expires_in,
    });
  } catch (err) {
    console.log(err);
  }
});

// Fetch Force24 token - not working yet
/*app.get('/api/force24-token', async (req, res) => {
  try {

    const token = await axios.get('https://identity.data-crypt.com/connect/token', qs.stringify({
      grant_type: 'client_credentials',
      client_id: `${process.env.FORCE24_CLIENT_API_ID}`,
      client_secret: `${process.env.FORCE24_CLIENT_API_SECRET}`
    }))

    force24AccessToken = token
    console.log(token);
  } catch (err) {
    console.log(err);
  }
})*/

// Fetch accounts from CYCLR API
app.get("/api/cyclr-accounts", async (req, res, next) => {
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

    console.log(JSON.stringify(cyclrResponse.data, null, 2));

    const cyclrAccounts = cyclrResponse.data.map((account) => ({
      "Cyclr Id": account.Id,
      "Cyclr Name": account.Name,
    }));

    fs.writeFile(
      "./cyclr-accounts.json",
      JSON.stringify(cyclrAccounts),
      (err) => {
        if (err) {
          console.log("Error writing file:", err);
        } else {
          console.log("File has been written");
        }
      }
    );

    return res.status(200).send({
      success: true,
      accounts: cyclrResponse.data,
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/client_id/:accountid/:accountName", async (req, res, next) => {
  const { accountid, accountName } = req.params;

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

    const clientId = cyclrRes.data
      .filter((item) => item.Name === "Force24 v2")[0]
      ?.Properties.filter((item) => item.Name === "ClientId")[0].Value;

    const accObj = {
      "Client Id": clientId,
      "Cyclr Name": accountName,
    };

    console.log(
      "Multiple styles: %cred %corange",
      "color: red",
      "color: orange",
      "Additional unformatted message"
    );

    // if (!fs.existsSync('./clientId.json')) {
    //   fs.writeFileSync('./clientId.json', JSON.stringify([]));
    //   const initialData = [accObj];
    //   fs.writeFileSync('./clientId.json', JSON.stringify(initialData, null, 2));
    // } else {
    //   const existingData = JSON.parse(fs.readFileSync('./clientId.json', 'utf8'));
    //   existingData.push(accObj);
    //   fs.writeFileSync('./clientId.json', JSON.stringify(existingData, null, 2));
    // }

    return res.status(200).send({ data: cyclrRes.data });
  } catch (err) {
    console.log(err);
  }
});

app.put("/api/client_id/:cyclrName/:force24Id", async (req, res) => {
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
    res.status(200).json(response.data);
  } catch (err) {
    console.log(`❌ Error: ${cyclrName}`, err.response?.data || err.message);
    res
      .status(err.response?.status || 500)
      .json({ error: err.message || "Unknown error" });
  }
});

// Fetch all accounts from Freshsuccess API
app.get("/api/freshsuccess-accounts", async (req, res) => {
  try {
    const response = await axios.get(
      "https://api-eu.freshsuccess.com/api/v2/accounts",
      {
        params: {
          api_key: process.env.FRESHSUCCESS_API_KEY,
        },
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // console.log(response.data.results.slice(0, 5));

    let freshsuccessAccounts = response.data.results.map((account) => ({
      id: account.account_id,
      "Freshsuccess Name": account.name,
    }));

    console.log(freshsuccessAccounts);

    fs.writeFile(
      "./freshsuccess-accounts.json",
      JSON.stringify(freshsuccessAccounts),
      (err) => {
        if (err) {
          console.error("Error writing file:", err);
          return res
            .status(500)
            .send({ success: false, error: "Failed to write data" });
        }
        console.log("File has been written");
      }
    );

    return res
      .status(200)
      .send({ success: true, response: response.data.results });
  } catch (error) {
    console.log(error);
  }
});

// // Error handling middleware - must be after all routes
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({
//     success: false,
//     error: 'Internal Server Error',
//     details: err.message
//   });
// });

// // Schedule CYCLR sync to run daily at 00:30 (30 minutes after Freshdesk sync)
// cron.schedule('30 0 * * *', async () => {
//   console.log('Running scheduled CYCLR sync...');
//   try {
//     const response = await axios.get('http://localhost:3010/api/cyclr-accounts');
//     console.log('Scheduled CYCLR sync completed:', response.data);
//   } catch (error) {
//     console.error('Scheduled CYCLR sync failed:', error.message);
//   }
// });

const entityIds = [];
//Gets contact info from transactions
// app.get("/api/client_id/:transactionid", async (req, res, next) => {
//   const { transactionid } = req.params;

//   try {
//     const cyclrRes = await axios.get(
//       `https://apiintegrations.force24.co.uk/v1.0/cycles/ac95eb01-aa21-4fdc-9e9a-1b77ac9a6ea4/transactions/${transactionid}`,
//       {
//         headers: {
//           Accept: "application/json",
//           Authorization: `Bearer ${cyclrAccessToken}`,
//           "X-Cyclr-Account":`ac95eb01-aa21-4fdc-9e9a-1b77ac9a6ea4`,
//           cycleId: "19dd9108-65b8-48ca-a682-31e411d73f5a",
//           id: `${transactionid}`,
//         },
//       }
//     );

//     const cyclrData = JSON.parse(
//       cyclrRes.data.filter(
//         (item) => item.StepId === "08ddadad-54aa-4143-8031-e415159e9bcf"
//       )[0].Response
//     ).entityId;

//     // const HEADER_ROW = [
//     //   {
//     //     value: 'First Name'
//     //   }
//     //   , {
//     //     value: 'Last Name'
//     //   }
//     //   , {
//     //     value: 'Email Address'
//     //   }
//     // ]

//     // const DATA_ROW = [
//     //   {
//     //     value: `${cyclrData.firstName}`
//     //   }
//     //   , {
//     //     value: `${cyclrData.lastName}`
//     //   }
//     //   , {
//     //     value: `${cyclrData.email}`
//     //   }
//     // ]

//     // if (!fs.existsSync(filePath)) {
//     //   await writeXlsxFile([HEADER_ROW, DATA_ROW], {
//     //     filePath: filePath,
//     //   })
//     // } else {
//     //   const rows = await readXlsxFile(filePath, { schema: false })
//     //   const updatedRows = [
//     //     ...rows.map(row => row.map(cell => ({ value: cell }))),
//     //     DATA_ROW
//     //   ]

//     //   await writeXlsxFile(updatedRows, {
//     //     filePath: filePath
//     //   });

//     // }
//     return res.status(200).send({ entityId: cyclrData });
//   } catch (err) {
//     console.log("Error", err);
//   }
// });

//Get Transaction IDs from a cycle
// app.get("/api/client_id/get_transactions", async (req, res, next) => {
//   try {
//     const cyclrRes = await axios.get(
//       `https://apiintegrations.force24.co.uk/v1.0/cycles/ac95eb01-aa21-4fdc-9e9a-1b77ac9a6ea4/transactions`,
//       {
//         headers: {
//           Accept: "application/json",
//           Authorization: `Bearer ${cyclrAccessToken}`,
//           "X-Cyclr-Account": `971b60dd-fcab-43d2-b939-23452765cb05`,
//           cycleId: "ac95eb01-aa21-4fdc-9e9a-1b77ac9a6ea4",
//         },
//         params: {
//           pageSize: 28000,
//           page: 1,
//           after: '2025-07-01T12:00:00+01:00'
//         },
//       }
//     );

//     cyclrRes.data.map((transaction) => entityIds.push(transaction.Id));

//     fs.writeFileSync(
//       "./working_t_transactionIds.json",
//       JSON.stringify(entityIds),
//       (err) => {
//         if (err) {
//           console.error("Trouble creating file:" + err);
//         }
//       }
//     );

//     console.log(entityIds.length);

//     return res.status(200);
//   } catch (err) {
//     console.log("Error", err);
//   }
// });

//Gets transactions that didn't finish
app.get("/api/unfinished_transactions", async (req, res, next) => {
  try {
    const transactionids = JSON.parse(
      fs.readFileSync("./working_t_transactionIds.json", "utf-8")
    ).slice(0, 5);

    let done = 0;

    const results = await Promise.all(
      transactionids.map(async (id) => {
        const { data } = await axios.get(
          `https://apiintegrations.force24.co.uk/v1.0/cycles/ac95eb01-aa21-4fdc-9e9a-1b77ac9a6ea4/transactions/${id}`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${cyclrAccessToken}`,
              "X-Cyclr-Account": `971b60dd-fcab-43d2-b939-23452765cb05`,
              cycleId: "ac95eb01-aa21-4fdc-9e9a-1b77ac9a6ea4",
              id: `${id}`,
            },
          }
        );

        process.stdout.write(`\r[${++done}/${transactionids.length}] finished`);

        const hasCreateAndUpdate = data.some(
          (x) => x.StepId === "216a761d-9a27-4f1d-8b52-b6e88e6692cb"
        );
        if (hasCreateAndUpdate) return null;

        const split = data.find(
          (x) =>
            x.StepId === "bf545bab-f1ec-434a-8c65-4d4f0e6440b5" &&
            x.Request.includes("Split From")
        );
        return split
          ? JSON.parse(split.Response)?.value?.[0]?.emailaddress1 ?? null
          : null;
      })
    );

    fs.writeFileSync('./emails.json', JSON.stringify(results.filter(Boolean))) 
    console.log('\nAll done');

    return res.status(200);
  } catch (err) {
    console.log("Error", err);
  }
});

app.get("/api/bool", async (req, res) => {
  try {
    const inputFile = resolve(__dirname, "./emails.xlsx");
    const outputFile = resolve(__dirname, "./email_results.xlsx");
    const rows = await readXlsxFile(inputFile);
    const emailList = rows.slice(15001).map((row) => row[0]);

    const HEADER_ROW = [
      { value: "Force24PersonId" },
      { value: "First Name" },
      { value: "Last Name" },
      { value: "Email Address" },
    ];

    const NEW_DATA_ROWS = [];

    for (let i = 0; i < emailList.length; i++) {
      const email = emailList[i];
      process.stdout.write(
        `\r[${i + 1}/${emailList.length}] Checking ${email}...`
      );

      const encodedEmail = encodeURIComponent(email);
      const url = `https://api.data-crypt.com/api/v1.3/contacts/find?emailAddress=${encodedEmail}&fields=emailaddress,firstname,lastname,id`;

      try {
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${process.env.FORCE24_CLIENT_API_SECRET}`,
          },
        });

        const data = response.data[0];

        NEW_DATA_ROWS.push([
          { value: data.id || "" },
          { value: data.firstname || "" },
          { value: data.lastname || "" },
          { value: data.emailaddress || email },
        ]);
      } catch (error) {
        console.error(`Error for ${email}:`, error.message);
        if (error.response?.status === 404) {
          NEW_DATA_ROWS.push([
            { value: "" },
            { value: "" },
            { value: "" },
            { value: email },
          ]);
        }
      }
    }

    console.log("\n✅ Finished processing emails");

    if (!fs.existsSync(outputFile)) {
      await writeXlsxFile([HEADER_ROW, ...NEW_DATA_ROWS], {
        filePath: outputFile,
      });
    } else {
      const existingRows = await readXlsxFile(outputFile);
      const existingFormatted = [
        ...existingRows.map((row) => row.map((cell) => ({ value: cell }))),
        ...NEW_DATA_ROWS,
      ];

      await writeXlsxFile(existingFormatted, {
        filePath: outputFile,
      });
    }

    res.status(200).json({ message: "Appended to email_results.xlsx" });
  } catch (err) {
    console.log("Error in catch block:", err);
    res.status(500).send("Server error");
  }
});

app.get("/api/duplicates", async (req, res) => {
  try {
    const response = await axios.get(
      `https://apiintegrations.force24.co.uk/v1.0/connectors/32764/methods`,
      {
        headers: {
          Authorization: `Bearer ${cyclrAccessToken}`,
        },
      }
    );
    console.log(response.data);
    res.status(200);
  } catch (err) {
    console.log(err);
  }
});

module.exports = app;
