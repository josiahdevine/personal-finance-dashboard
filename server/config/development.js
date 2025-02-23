module.exports = {
    database: {
        url: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/personal_finance',
        ssl: process.env.NODE_ENV === 'production' ? {
            rejectUnauthorized: false
        } : false
    },
    cors: {
        origin: ['http://localhost:3000'],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization']
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'your-development-secret-key',
        expiresIn: '7d'
    }
}; 