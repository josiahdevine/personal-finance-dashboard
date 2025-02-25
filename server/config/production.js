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
            'https://willowy-choux-870c3b.netlify.app',
            'http://localhost:3000'
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