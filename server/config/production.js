module.exports = {
    database: {
        url: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false,
            require: true
        }
    },
    cors: {
        origin: [
            'https://trypersonalfinance.com',
            'https://www.trypersonalfinance.com',
            'https://api.trypersonalfinance.com',
            'https://personal-finance-dashboard-toaas.vercel.app',
            'https://personal-finance-dashboard-topaz.vercel.app'
        ],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
        credentials: true,
        maxAge: 86400,
        preflightContinue: false,
        optionsSuccessStatus: 204
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: '7d'
    }
}; 