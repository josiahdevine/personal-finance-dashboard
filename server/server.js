const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
const dns = require('dns');
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

// Configure CORS with the config
app.use(cors(config.cors));

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

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to PostgreSQL:', err);
  } else {
    console.log('Database connection successful:', res.rows[0].now);
  }
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/plaid', authenticateToken, plaidRoutes);
app.use('/api/salary', authenticateToken, salaryRoutes);
app.use('/api/manual-accounts', authenticateToken, manualAccountRoutes);
app.use('/api/stocks', authenticateToken, stockRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`);
});

app.get('/api/salary-journal/:userId', authenticateToken, SalaryJournalController.getSalaryJournal);
app.put('/api/salary-journal/:entryId', authenticateToken, SalaryJournalController.updateSalaryEntry);
app.delete('/api/salary-journal/:entryId', authenticateToken, SalaryJournalController.deleteSalaryEntry);