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
            'https://personal-finance-dashboard-topaz.vercel.app',
            'https://personal-finance-dashboard.vercel.app',
            'https://personal-finance-dashboard-bwqbafd47-josiah-devines-projects.vercel.app',
            'https://personal-finance-dashboard-topaz.vercel.app',
            'https://personal-finance-dashboard-igc6w64yl-josiah-devines-projects.vercel.app'
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