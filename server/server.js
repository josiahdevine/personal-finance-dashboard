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
const { authenticateToken } = require('./middleware/auth');
const SalaryJournalController = require('./controller/SalaryJournalController');

const app = express();

// Configure CORS
app.use(cors(config.cors));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global middleware to handle CORS preflight
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
        console.log('Handling OPTIONS request for:', req.path);
        return res.status(204).end();
    }
    next();
});

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

// Test database connection
async function testDatabaseConnection() {
    try {
        const result = await pool.query('SELECT NOW()');
        console.log('Database connection successful:', result.rows[0].now);
        return true;
    } catch (error) {
        console.error('Database connection error:', error.message);
        return false;
    }
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/plaid', authenticateToken, plaidRoutes);
app.use('/api/salary', authenticateToken, salaryRoutes);
app.use('/api/manual-accounts', authenticateToken, manualAccountRoutes);
app.use('/api/stocks', authenticateToken, stockRoutes);

// Health check endpoint
app.get('/health', async (req, res) => {
    const dbConnected = await testDatabaseConnection();
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

// Error handling middleware
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

// Start server
const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`);
    testDatabaseConnection();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    // Don't exit the process in production, just log the error
    if (process.env.NODE_ENV !== 'production') {
        server.close(() => process.exit(1));
    }
});

module.exports = app;