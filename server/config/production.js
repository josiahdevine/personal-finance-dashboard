module.exports = {
    database: {
        url: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false,
            require: true
        }
    },
    cors: {
        origin: '*',  // Allow all origins temporarily for debugging
        methods: ['GET', 'POST', 'PUT', DELETE, 'OPTIONS', 'PATCH'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'X-Requested-With',
            'Accept',
            'Origin',
            'Access-Control-Request-Method',
            'Access-Control-Request-Headers'
        ],
        exposedHeaders: ['Content-Length', 'X-Requested-With'],
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