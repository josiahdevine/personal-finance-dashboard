const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
const dns = require('dns');
const path = require('path');
dotenv.config();

const config = require(`./config/${process.env.NODE_ENV === 'production' ? 'production' : 'development'}.js`);
const pool = require('./db');
const authRoutes = require('./routes/authRoutes');
const plaidRoutes = require('./routes/plaidRoutes');
const salaryRoutes = require('./routes/salaryRoutes');
const manualAccountRoutes = require('./routes/manualAccountRoutes');
const stockRoutes = require('./routes/stockRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const goalRoutes = require('./routes/goalRoutes');
const { authenticateToken } = require('./middleware/auth');
const SalaryJournalController = require('./controller/SalaryJournalController');
const loanRoutes = require('./routes/loanRoutes');
const investmentRoutes = require('./routes/investmentRoutes');

const app = express();

// Improved error handling for serverless environment
let dbConnection = null;

// Initialize database connection
async function initializeDatabase() {
    if (!dbConnection) {
        try {
            const testResult = await pool.query('SELECT NOW()');
            console.log('Database connection successful:', testResult.rows[0].now);
            dbConnection = pool;
            return true;
        } catch (error) {
            console.error('Database connection error:', error.message);
            return false;
        }
    }
    return true;
}

// Debug middleware with improved error handling
app.use((req, res, next) => {
    console.log('Request:', {
        method: req.method,
        path: req.path,
        headers: req.headers,
        body: req.body,
        query: req.query
    });

    // Capture the original send with error handling
    const originalSend = res.send;
    res.send = function(data) {
        try {
            console.log('Response:', {
                statusCode: res.statusCode,
                headers: res._headers,
                body: data
            });
            return originalSend.apply(res, arguments);
        } catch (error) {
            console.error('Error in response:', error);
            return originalSend.apply(res, [{ error: 'Internal Server Error' }]);
        }
    };

    next();
});

// CORS configuration with error handling
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) {
            return callback(null, true);
        }

        const allowedOrigins = [
            'https://trypersonalfinance.com',
            'https://www.trypersonalfinance.com',
            'https://api.trypersonalfinance.com',
            'http://localhost:3000'
        ];

        if (allowedOrigins.includes(origin) || origin.includes('vercel.app')) {
            callback(null, true);
        } else {
            console.log('Origin not allowed by CORS:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Authorization'],
    maxAge: 86400
};

// Middleware with error handling
app.use(async (req, res, next) => {
    try {
        await initializeDatabase();
        next();
    } catch (error) {
        console.error('Middleware error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set DNS resolution options
dns.setDefaultResultOrder('ipv4first');

// Initialize Plaid client
const plaidConfig = new Configuration({
    basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
    baseOptions: {
        headers: {
            'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
            'PLAID-SECRET': process.env.PLAID_SECRET,
        },
        timeout: 10000,
    },
});

const plaidClient = new PlaidApi(plaidConfig);
app.locals.plaidClient = plaidClient;

// Log environment variables (excluding sensitive data)
console.log('Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    DATABASE_URL: process.env.DATABASE_URL ? '**present**' : '**missing**',
    JWT_SECRET: process.env.JWT_SECRET ? '**present**' : '**missing**',
    PLAID_ENV: process.env.PLAID_ENV
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/plaid', authenticateToken, plaidRoutes);
app.use('/api/salary', authenticateToken, salaryRoutes);
app.use('/api/manual-accounts', authenticateToken, manualAccountRoutes);
app.use('/api/stocks', authenticateToken, stockRoutes);
app.use('/api/transactions', authenticateToken, transactionRoutes);
app.use('/api/goals', authenticateToken, goalRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/investments', investmentRoutes);

// Health check endpoint
app.get('/health', async (req, res) => {
    const dbConnected = await initializeDatabase();
    res.json({
        status: dbConnected ? 'ok' : 'database_error',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        database: dbConnected ? 'connected' : 'error'
    });
});

// Root route handler
app.get('/', (req, res) => {
    res.json({
        message: 'Personal Finance Dashboard API',
        version: '1.0.0',
        status: 'running',
        environment: process.env.NODE_ENV,
        endpoints: {
            auth: '/api/auth',
            plaid: '/api/plaid',
            salary: '/api/salary',
            manualAccounts: '/api/manual-accounts',
            stocks: '/api/stocks',
            health: '/health'
        }
    });
});

// Handle salary journal routes
app.get('/api/salary-journal/:userId', authenticateToken, SalaryJournalController.getSalaryJournal);
app.put('/api/salary-journal/:entryId', authenticateToken, SalaryJournalController.updateSalaryEntry);
app.delete('/api/salary-journal/:entryId', authenticateToken, SalaryJournalController.deleteSalaryEntry);

// Enhanced error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        path: req.path,
        method: req.method
    });

    // Handle specific error types
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Validation Error',
            message: err.message
        });
    }

    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid or missing authentication token'
        });
    }

    // Default error response
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
    });
});

// Serverless-friendly startup
if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT || 5000;
    app.listen(port, async () => {
        console.log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`);
        await initializeDatabase();
    });
}

module.exports = app;