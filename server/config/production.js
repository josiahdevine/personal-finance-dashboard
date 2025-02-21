module.exports = {
    database: {
        url: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    },
    cors: {
        origin: [
            'https://personal-finance-dashboard-topaz.vercel.app',
            'https://personal-finance-dashboard-git-main-josiahs-projects.vercel.app',
            'https://personal-finance-dashboard-josiahs-projects.vercel.app',
            'https://personal-finance-dashboard.vercel.app'
        ],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization']
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: '7d'
    }
}; 