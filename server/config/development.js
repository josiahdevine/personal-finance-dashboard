module.exports = {
    database: {
        url: process.env.DATABASE_URL,
        ssl: false
    },
    cors: {
        origin: ['http://localhost:3000'],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization']
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: '7d'
    }
}; 