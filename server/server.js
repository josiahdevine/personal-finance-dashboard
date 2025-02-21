const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
const dns = require('dns');
dotenv.config(); // Correctly call the config method
const pool = require('./db'); // Import the database connection pool
const authRoutes = require('./routes/authRoutes');
const plaidRoutes = require('./routes/plaidRoutes');
const salaryRoutes = require('./routes/salaryRoutes');
const manualAccountRoutes = require('./routes/manualAccountRoutes');
const stockRoutes = require('./routes/stockRoutes');
const { authenticateToken } = require('./middleware/auth');
const SalaryJournalController = require('./controller/SalaryJournalController');

const app = express();

// Configure CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

app.use(express.json()); // Ensure that the JSON is working
app.use(express.urlencoded({ extended: true }));

// Set DNS resolution options
dns.setDefaultResultOrder('ipv4first');

// Initialize Plaid client
console.log('Initializing Plaid client with environment:', process.env.PLAID_ENV);
console.log('Plaid Client ID:', process.env.PLAID_CLIENT_ID);
console.log('Plaid Secret length:', process.env.PLAID_SECRET?.length);

const plaidConfig = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
    timeout: 10000, // 10 second timeout
  },
});

const plaidClient = new PlaidApi(plaidConfig);

// Make plaidClient available to routes
app.locals.plaidClient = plaidClient;

// Test Plaid client
plaidClient.sandboxPublicTokenCreate({
  institution_id: 'ins_109508',
  initial_products: ['auth']
})
.then(() => {
  console.log('Plaid client initialized successfully');
})
.catch((error) => {
  console.error('Error testing Plaid client:', error.response?.data || error);
});

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
app.use('/api/plaid', plaidRoutes);
app.use('/api/salary', authenticateToken, salaryRoutes);
app.use('/api/manual-accounts', manualAccountRoutes);
app.use('/api/stocks', stockRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running' });
});

const port = process.env.PORT || 5000;

// Handle server startup errors
const startServer = () => {
  const server = app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.log(`Port ${port} is busy, retrying in 1 second...`);
      setTimeout(() => {
        server.close();
        startServer();
      }, 1000);
    } else {
      console.error('Server error:', error);
    }
  });
};

startServer();

app.get('/api/salary-journal/:userId', authenticateToken, SalaryJournalController.getSalaryJournal);
app.put('/api/salary-journal/:entryId', authenticateToken, SalaryJournalController.updateSalaryEntry);
app.delete('/api/salary-journal/:entryId', authenticateToken, SalaryJournalController.deleteSalaryEntry);