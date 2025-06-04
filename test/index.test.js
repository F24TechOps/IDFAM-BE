const supertest = require('supertest')
const app = require('../index.js')
const request = supertest(app)

beforeAll(async () => {
    await request.get('/api/cyclr-token')
})

describe.skip('get cyclr token', () => {
    test('token', async () => {
        return await request.get('/api/cyclr-token')
            .expect(200).then((response) => {
            expect(response.body.success).toBe(true)
            expect(response.body.token).toBeDefined()
            expect(typeof response.body.token).toBe('string')
        })
    })
})

describe.skip('get accounts from cyclr', () => {
    test('return all accounts', () => {
        const res = request.get('/api/cyclr-accounts')
        return res.expect(200).then((res) => {
            expect(res.body.success).toBe(true)
            expect(res.body.accounts).toBeDefined()
            expect(Array.isArray(res.body.accounts)).toBe(true)
        })
    })
})

describe('get all the accounts in freshsuccess', () => {
    test('return all accounts', async () => {
        const res = await request.get('/api/freshsuccess-accounts')
        return res.expect(200).then((res) => {
            expect(res.body.success).toBe(true)
            expect(res.body.accounts).toBeDefined()
            expect(Array.isArray(res.body.accounts)).toBe(true)
        })
    })
})
