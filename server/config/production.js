module.exports = {
    database: {
        url: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    },
    cors: {
        origin: [
            'https://personal-finance-dashboard-git-main-josiahs-projects.vercel.app',
            'https://personal-finance-dashboard-josiahs-projects.vercel.app',
            'https://personal-finance-dashboard.vercel.app'
        ],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: '7d'
    }
}; 