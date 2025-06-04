const express = require('express');
const { resolve } = require('path');
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const cron = require('node-cron');
require('dotenv').config();
const qs = require('qs');

const app = express();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

let cyclrAccessToken;

app.use(express.static('static'));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(resolve(__dirname, 'pages/index.html'));
});

// Fetch CYCLR token
app.get('/api/cyclr-token', async (req, res) => {
  try {
    const token = await axios.post('https://apiintegrations.force24.co.uk/oauth/token',
      qs.stringify({
        grant_type: 'client_credentials',
        client_id: `${process.env.CYCLR_API_ID}`,
        client_secret: `${process.env.CYCLR_API_SECRET}`
      })
    )

    cyclrAccessToken = token.data.access_token;
    cyclrTokenType = token.data.token_type;
    cyclrExpiresIn = token.data.expires_in;

    return res.status(200).json({
      success: true,
      token: token.data.access_token,
      token_type: token.data.token_type,
      expires_in: token.data.expires_in
    });
  }
  catch (err) {
    console.log(err);
  }
})

// Fetch accounts from CYCLR API
app.get('/api/cyclr-accounts', async (req, res, next) => {
  try {
    // Fetch CYCLR account
    const cyclrResponse = await axios.get('https://apiintegrations.force24.co.uk/v1.0/accounts', {
      params: {
        pageSize: 100,
        page: 1,
        sortOrderAsc: true
      },
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${cyclrAccessToken}`,
      }
    });

    console.log(JSON.stringify(cyclrResponse.data, null, 2));

    return res.status(200).send({
      success: true,
      accounts: cyclrResponse.data
    });
  } catch (error) {
    next(error);
  }
});


// Fetch all accounts from Freshsuccess API
app.get('/api/freshsuccess-accounts', async (req, res) => {
  try {
    const response = await axios.get('https://api-eu.freshsuccess.com/api/v2/accounts', {
      params: {
        api_key: process.env.FRESHSUCCESS_API_KEY
      },
      headers: {
        'Content-Type': 'application/json'
      }

    });

    console.log(response.data.results);
    
    return res.status(200).send({ response: response.data });
  }

  catch (error) {
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



module.exports = app;