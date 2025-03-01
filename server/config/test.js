require('dotenv').config();

module.exports = {
    database: {
        connectionString: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        },
        max: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'test-secret-key',
        expiresIn: '1d'
    },
    plaid: {
        clientId: process.env.PLAID_CLIENT_ID || 'test-client-id',
        secret: process.env.PLAID_SECRET || 'test-secret',
        env: process.env.PLAID_ENV || 'sandbox',
        products: ['transactions', 'auth'],
        countryCodes: ['US'],
        redirectUri: null
    }
}; 