const plaid = require('plaid');
require('dotenv').config();

// Log the environment mode
console.log(`Initializing Plaid in ${process.env.PLAID_ENV || 'sandbox'} mode`);

// Get environment variables with fallbacks
const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID || process.env.REACT_APP_PLAID_CLIENT_ID;
const PLAID_SECRET = process.env.PLAID_SECRET || process.env.REACT_APP_PLAID_SECRET;
const PLAID_ENV = process.env.PLAID_ENV || process.env.REACT_APP_PLAID_ENV || 'sandbox';

// Map environment string to Plaid environment object
const environmentMap = {
  'sandbox': plaid.PlaidEnvironments.sandbox,
  'development': plaid.PlaidEnvironments.development,
  'production': plaid.PlaidEnvironments.production
};

// Create Plaid client
const client = new plaid.PlaidApi(new plaid.Configuration({ 
  clientID: PLAID_CLIENT_ID, 
  secret: PLAID_SECRET,  
  environment: environmentMap[PLAID_ENV] || plaid.PlaidEnvironments.sandbox, 
  options: {
    version: '2020-09-14',      
  },
}));

// Log configuration status (without exposing secrets)
console.log(`Plaid client configured with:
  - Client ID: ${PLAID_CLIENT_ID ? '✓ (Set)' : '✗ (Missing)'}
  - Secret: ${PLAID_SECRET ? '✓ (Set)' : '✗ (Missing)'}
  - Environment: ${PLAID_ENV}
`);

module.exports = client;