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

// Development mock mode - used when database or API is not available
const useMockData = process.env.USE_PLAID_MOCK === 'true' || !PLAID_CLIENT_ID || !PLAID_SECRET;

if (useMockData) {
  console.log('⚠️ Using Plaid mock data - FOR DEVELOPMENT ONLY');
  
  // Mock data for development and testing
  const mockPlaidData = {
    items: [
      { 
        item_id: 'mock_item_1',
        institution_id: 'ins_1',
        webhook: 'https://webhook.example.com',
        error: null,
        available_products: ['transactions', 'auth', 'identity'],
        billed_products: ['transactions'],
        consent_expiration_time: null,
        update_type: 'background'
      }
    ],
    accounts: [
      {
        account_id: 'mock_account_1',
        item_id: 'mock_item_1',
        name: 'Mock Checking',
        mask: '1234',
        official_name: 'MOCK CHECKING ACCOUNT',
        type: 'depository',
        subtype: 'checking',
        verification_status: 'automatically_verified',
        balances: {
          available: 1250.45,
          current: 1274.93,
          limit: null,
          iso_currency_code: 'USD',
          unofficial_currency_code: null
        }
      },
      {
        account_id: 'mock_account_2',
        item_id: 'mock_item_1',
        name: 'Mock Savings',
        mask: '5678',
        official_name: 'MOCK SAVINGS ACCOUNT',
        type: 'depository',
        subtype: 'savings',
        verification_status: 'automatically_verified',
        balances: {
          available: 5400.23,
          current: 5400.23,
          limit: null,
          iso_currency_code: 'USD',
          unofficial_currency_code: null
        }
      },
      {
        account_id: 'mock_account_3',
        item_id: 'mock_item_1',
        name: 'Mock Credit Card',
        mask: '9012',
        official_name: 'MOCK CREDIT CARD',
        type: 'credit',
        subtype: 'credit card',
        verification_status: 'automatically_verified',
        balances: {
          available: 2200.00,
          current: 745.86,
          limit: 3000.00,
          iso_currency_code: 'USD',
          unofficial_currency_code: null
        }
      }
    ],
    transactions: [
      {
        transaction_id: 'mock_txn_1',
        account_id: 'mock_account_1',
        amount: 25.50,
        date: '2023-02-28',
        name: 'MOCK COFFEE SHOP',
        merchant_name: 'Coffee House',
        category: ['Food and Drink', 'Restaurants', 'Coffee Shop'],
        pending: false,
        payment_channel: 'in store'
      },
      {
        transaction_id: 'mock_txn_2',
        account_id: 'mock_account_1',
        amount: 112.42,
        date: '2023-02-27',
        name: 'MOCK GROCERY STORE',
        merchant_name: 'Grocery Market',
        category: ['Food and Drink', 'Groceries'],
        pending: false,
        payment_channel: 'in store'
      },
      {
        transaction_id: 'mock_txn_3',
        account_id: 'mock_account_3',
        amount: 49.99,
        date: '2023-02-26',
        name: 'MOCK ONLINE RETAILER',
        merchant_name: 'Online Shop',
        category: ['Shops', 'Online Marketplaces'],
        pending: false,
        payment_channel: 'online'
      }
    ]
  };

  // Override the Plaid client with mock methods
  client.mockData = mockPlaidData;
  
  // Mock methods that return the mock data
  client.itemGet = async (request) => {
    const { access_token } = request;
    return {
      data: {
        item: mockPlaidData.items[0],
        status: {}
      }
    };
  };
  
  client.accountsGet = async (request) => {
    return {
      data: {
        accounts: mockPlaidData.accounts,
        item: mockPlaidData.items[0]
      }
    };
  };
  
  client.transactionsGet = async (request) => {
    return {
      data: {
        transactions: mockPlaidData.transactions,
        accounts: mockPlaidData.accounts,
        total_transactions: mockPlaidData.transactions.length,
        item: mockPlaidData.items[0]
      }
    };
  };
  
  client.linkTokenCreate = async (request) => {
    return {
      data: {
        link_token: 'mock_link_token_' + Date.now(),
        expiration: new Date(Date.now() + 1000 * 60 * 5).toISOString(),
        request_id: 'mock_request_' + Date.now()
      }
    };
  };
  
  client.itemPublicTokenExchange = async (request) => {
    return {
      data: {
        access_token: 'mock_access_token_' + Date.now(),
        item_id: mockPlaidData.items[0].item_id,
        request_id: 'mock_request_' + Date.now()
      }
    };
  };
}

module.exports = client;