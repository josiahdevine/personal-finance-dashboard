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
            'https://personal-finance-dashboard-git-main-josiahs-projects.vercel.app',
            'https://personal-finance-dashboard-josiahs-projects.vercel.app',
            'https://personal-finance-dashboard-ctnhgtu27-josiah-devines-projects.vercel.app',
            'https://personal-finance-dashboard-homk38q0j-josiah-devines-projects.vercel.app',
            /\.vercel\.app$/
        ],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
        credentials: false,
        maxAge: 86400, // 24 hours
        exposedHeaders: ['Authorization']
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: '7d'
    }
}; 