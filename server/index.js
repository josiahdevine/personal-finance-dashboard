const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');

// Load environment variables
dotenv.config();

// Import middlewares
const { authenticateToken } = require('./middleware/auth');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const plaidRoutes = require('./routes/plaidRoutes');
const { plaidClient, PLAID_ENV } = require('./plaid');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Logging middleware
app.use(morgan('dev'));

// CORS configuration
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    
    // Define allowed origins
    const allowedOrigins = process.env.NODE_ENV === 'production'
      ? (process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [process.env.ALLOWED_ORIGIN || '*'])
      : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'];
    
    // Check if the origin is allowed
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      callback(null, true); // Temporarily allow all origins in production for debugging
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  maxAge: 86400 // Cache preflight requests for 24 hours
}));

// Parse JSON requests
app.use(express.json());

// Make Plaid client available to all routes
app.locals.plaidClient = plaidClient;

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
    plaidEnv: PLAID_ENV
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/plaid', plaidRoutes);

// Webhook route - needs raw body for verification
app.use('/api/webhooks/plaid', express.raw({ type: 'application/json' }));
app.post('/api/webhooks/plaid', async (req, res) => {
  // Plaid webhooks are handled separately to deal with raw body
  try {
    const buffer = req.body.toString('utf8');
    const data = JSON.parse(buffer);
    console.log('Received Plaid webhook:', data.webhook_type, data.webhook_code);
    res.status(200).send({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).send({ error: 'Error processing webhook' });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Server error', 
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
  });
});

// Log environment configuration for debugging
console.log('Server Environment:', {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PLAID_ENV: PLAID_ENV,
  PORT: PORT,
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || process.env.ALLOWED_ORIGIN || 'all'
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Plaid environment: ${PLAID_ENV}`);
});

module.exports = app; 