const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
require('dotenv').config();

// Log the current environment mode
console.log(`Initializing Plaid client in ${process.env.PLAID_ENV || 'sandbox'} mode`);

// Get configuration from environment variables
const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID || process.env.REACT_APP_PLAID_CLIENT_ID;
const PLAID_SECRET = process.env.PLAID_SECRET || process.env.REACT_APP_PLAID_SECRET;
const PLAID_ENV = process.env.PLAID_ENV || process.env.REACT_APP_PLAID_ENV || 'sandbox';
const PLAID_PRODUCTS = (process.env.PLAID_PRODUCTS || 'transactions,auth').split(',');
const PLAID_COUNTRY_CODES = (process.env.PLAID_COUNTRY_CODES || 'US').split(',');
const PLAID_REDIRECT_URI = process.env.PLAID_REDIRECT_URI || '';

// Log configuration status (without exposing secrets)
console.log('Plaid Configuration Status:');
console.log(`- Client ID: ${PLAID_CLIENT_ID ? 'Set ✓' : 'Missing ✗'}`);
console.log(`- Secret: ${PLAID_SECRET ? 'Set ✓' : 'Missing ✗'}`);
console.log(`- Environment: ${PLAID_ENV}`);
console.log(`- Products: ${PLAID_PRODUCTS.join(', ')}`);
console.log(`- Country Codes: ${PLAID_COUNTRY_CODES.join(', ')}`);
console.log(`- Redirect URI: ${PLAID_REDIRECT_URI || 'Not set'}`);

if (!PLAID_CLIENT_ID || !PLAID_SECRET) {
  console.error('Error: Plaid credentials not found in environment variables!');
  console.error('Please set PLAID_CLIENT_ID and PLAID_SECRET in your .env file');
}

// Map environment string to Plaid environment
const getPlaidEnvironment = (env) => {
  switch (env.toLowerCase()) {
    case 'production':
      return PlaidEnvironments.production;
    case 'development':
      return PlaidEnvironments.development;
    case 'sandbox':
    default:
      return PlaidEnvironments.sandbox;
  }
};

// Create a Plaid client
const configuration = new Configuration({
  basePath: getPlaidEnvironment(PLAID_ENV),
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
      'PLAID-SECRET': PLAID_SECRET,
      'Plaid-Version': '2020-09-14',
    },
  },
});

const plaidClient = new PlaidApi(configuration);

module.exports = {
  plaidClient,
  PLAID_PRODUCTS,
  PLAID_COUNTRY_CODES,
  PLAID_REDIRECT_URI,
  PLAID_ENV
};