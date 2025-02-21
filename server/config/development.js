module.exports = {
    database: {
        url: process.env.DATABASE_URL,
        ssl: false
    },
    cors: {
        origin: ['http://localhost:3000', 'http://localhost:5000'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: '7d'
    }
}; 