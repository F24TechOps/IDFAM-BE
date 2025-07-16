const supertest = require("supertest");
const app = require("../index.js");
const fs = require("fs");
const request = supertest(app);
const data = require("../F24Ids.json");

beforeAll(async () => {
  await request.get("/api/cyclr-token");
});

describe.skip("get cyclr token", () => {
  test("token", async () => {
    return await request
      .get("/api/cyclr-token")
      .expect(200)
      .then((response) => {
        expect(response.body.success).toBe(true);
        expect(response.body.token).toBeDefined();
        expect(typeof response.body.token).toBe("string");
      });
  });
});

describe.skip("get accounts from cyclr", () => {
  test("return all accounts", () => {
    const res = request.get("/api/cyclr-accounts");
    return res.expect(200).then((res) => {
      expect(res.body.success).toBe(true);
      expect(res.body.accounts).toBeDefined();
      expect(Array.isArray(res.body.accounts)).toBe(true);
    });
  });
});

describe.skip("get all the accounts in freshsuccess", () => {
  test("return all accounts", () => {
    const res = request.get("/api/freshsuccess-accounts");
    return res.expect(200).then((res) => {
      expect(res.body.success).toBe(true);
      expect(res.body.response).toBeDefined();
      expect(Array.isArray(res.body.response)).toBe(true);
    });
  });
});

describe.skip("update cyclr account with force24 id", () => {
  const errors = [];
  let successCount = 0;

  data.forEach((account, index) => {
    test(`(${index + 1}/${data.length}) responds with a 200 for account ${
      account.name
    }`, async () => {
      try {
        console.log(`🔄 Testing: ${account.name}`);
        await request
          .put(`/api/client_id/${account.name}/${account.account_id}`)
          .expect(200);
        console.log(`✅ Passed: ${account.name}`);
        successCount++;
      } catch (err) {
        console.log(`❌ Failed: ${account.name}`);
        errors.push({ name: account.name, error: err.message });
      }
    });
  });

  afterAll(() => {
    const summary = [
      `\n--- Test Summary ---`,
      `✅ Successful: ${successCount}`,
      `❌ Failed: ${errors.length}`,
      errors.length > 0 ? `\n🔍 Error Details:` : "",
      ...errors.map(({ name, error }) => `- ${name}: ${error}`),
    ]
      .filter(Boolean)
      .join("\n");

    console.log(summary);
  });
});

// describe.skip('get the transaction details', () => {
//     const cyclrAccounts = JSON.parse(fs.readFileSync('./contactDistListTransId.json', 'utf8'))
//     cyclrAccounts.forEach((transaction) => {
//         test(`responds with a 200 for transaction: ${transaction}`, async () => {
//             return await request.get(`/api/client_id/${transaction}`).expect(200)
//         })
//     })

//     // test('responds with a 200', () => {
//     //     const res = request.get(`/api/client_id/7e001c9e-7ce2-4901-ae54-5586b464b5da`)
//     //     return res.expect(200)
//     // })
// })

describe.skip("get the transaction details", () => {
  //const cyclrAccounts = JSON.parse(fs.readFileSync('./contactDistListTransId.json', 'utf8'))
  let entityIds = [];
  test("responds with 200", async () => {
    return await request.get(`/api/client_id/get_transactions`).expect(200);
  });

  //         const entityId = res.body?.entityId;
  //         if (entityId) {
  //             entityIds.push(entityId);
  //         }

  // afterAll(() => {
  //     fs.writeFileSync(`./importData${Math.floor(1000 + Math.random() * 9000)}.json`, JSON.stringify(entityIds, null, 2));
  //     console.log('✅ entityIds.json written from test');
  // });
});

describe.skip("get the force24 token successfully", () => {
  test("token", async () => {
    return await request.get("/api/force24-token").expect(200);
  });
});

describe.skip("get the force24 data successfully", () => {
  jest.setTimeout(1400000);
  test("data", async () => {
    return await request.get("/api/bool").expect(200);
  });
});

describe.skip("get the methods", () => {
  test("data 2", async () => {
    return await request.get("/api/duplicates").expect(200);
  });
});

describe("get unfinished transactions", () => {
  test("responds with a 200", async () => {
    return await request.get("/api/unfinished_transactions").expect(200);
  });
});
