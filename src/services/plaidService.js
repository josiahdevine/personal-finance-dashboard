import axios from 'axios';
import { getToken } from './auth';

// Create a dedicated Plaid API instance
const plaidApi = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 
           (window.location.hostname === 'localhost' ? 
           'http://localhost:8888/.netlify/functions' : 
           'https://api.trypersonalfinance.com'),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'X-Environment': process.env.NODE_ENV || 'development'
  },
  validateStatus: function (status) {
    return status >= 200 && status < 500;
  },
  withCredentials: false // Disable credentials for CORS
});

// Add request interceptor for authentication and logging
plaidApi.interceptors.request.use(
  async (config) => {
    try {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Add request ID for tracking
      config.headers['X-Request-ID'] = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Log request for debugging
      console.log('[Plaid] Request:', {
        method: config.method?.toUpperCase(),
        url: `${config.baseURL}${config.url}`,
        environment: process.env.NODE_ENV,
        requestId: config.headers['X-Request-ID']
      });
    } catch (error) {
      console.error('[Plaid] Error adding auth token:', error);
    }
    return config;
  }
);

// Add response interceptor for error handling
plaidApi.interceptors.response.use(
  response => response,
  error => {
    console.error('[Plaid] API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: {
          ...error.config?.headers,
          Authorization: error.config?.headers?.Authorization ? '[REDACTED]' : undefined
        }
      }
    });
    return Promise.reject(error);
  }
);

const PLAID_API_ENDPOINTS = {
  createLinkToken: '/plaid-link-token',
  exchangePublicToken: '/plaid-exchange-token',
  getAccounts: '/plaid-accounts',
  getTransactions: '/plaid-transactions',
  getBalance: '/plaid-balance-history',
  syncTransactions: '/plaid-transactions-sync',
  getInstitution: '/plaid-status',
  removeAccount: '/plaid-accounts/remove',
  updateAccount: '/plaid-accounts/update',
};

/**
 * Custom error class for Plaid service errors
 */
export class PlaidServiceError extends Error {
  constructor(message, code, plaidError = null) {
    super(message);
    this.name = 'PlaidServiceError';
    this.code = code;
    this.plaidError = plaidError;
  }
}

/**
 * Handles API errors and formats them consistently
 * 
 * @param {Error} error - The caught error
 * @returns {PlaidServiceError} Formatted error object
 */
const handleApiError = (error) => {
  console.error('Plaid API Error:', error);
  
  // Handle axios errors
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const plaidError = error.response.data.error || null;
    const errorMessage = plaidError?.error_message || error.response.data.message || 'Server error';
    const errorCode = error.response.status;
    
    return new PlaidServiceError(errorMessage, errorCode, plaidError);
  } else if (error.request) {
    // The request was made but no response was received
    return new PlaidServiceError('No response from server. Please check your connection.', 'NETWORK_ERROR');
  } else {
    // Something happened in setting up the request that triggered an Error
    return new PlaidServiceError(error.message || 'Unknown error occurred', 'UNKNOWN_ERROR');
  }
};

/**
 * Plaid Service - Handles all interactions with Plaid API
 */
const plaidService = {
  /**
   * Creates a link token to initialize Plaid Link
   * 
   * @param {Object} userData - User data to associate with the token
   * @returns {Promise<string>} Link token
   */
  createLinkToken: async (userData) => {
    try {
      const response = await plaidApi.post('/plaid/link-token');
      return response.data.link_token;
    } catch (error) {
      console.error('[Plaid] Error creating link token:', error);
      throw error;
    }
  },
  
  /**
   * Exchanges a public token for an access token
   * 
   * @param {string} publicToken - The public token received from Plaid Link
   * @param {Object} metadata - Metadata about the institution
   * @returns {Promise<Object>} Access token and account information
   */
  exchangePublicToken: async (publicToken) => {
    try {
      const response = await plaidApi.post('/plaid/exchange-token', { public_token: publicToken });
      return response.data;
    } catch (error) {
      console.error('[Plaid] Error exchanging public token:', error);
      throw error;
    }
  },
  
  /**
   * Fetches accounts for the user
   * 
   * @param {string} userId - User ID
   * @returns {Promise<Array>} List of accounts
   */
  getAccounts: async () => {
    try {
      const response = await plaidApi.get('/plaid/accounts');
      return response.data;
    } catch (error) {
      console.error('[Plaid] Error getting accounts:', error);
      throw error;
    }
  },
  
  /**
   * Fetches transactions for the specified accounts and date range
   * 
   * @param {string} userId - User ID
   * @param {Array<string>} accountIds - Account IDs to fetch transactions for (optional)
   * @param {Object} options - Fetch options
   * @param {string} options.startDate - Start date in YYYY-MM-DD format
   * @param {string} options.endDate - End date in YYYY-MM-DD format
   * @param {number} options.limit - Maximum number of transactions to return
   * @param {number} options.offset - Offset for pagination
   * @returns {Promise<Object>} Transactions data
   */
  getTransactions: async (startDate, endDate) => {
    try {
      const response = await plaidApi.get('/plaid/transactions', {
        params: { start_date: startDate, end_date: endDate }
      });
      return response.data;
    } catch (error) {
      console.error('[Plaid] Error getting transactions:', error);
      throw error;
    }
  },
  
  /**
   * Syncs transactions incrementally to avoid large data transfers
   * 
   * @param {string} userId - User ID
   * @param {string} cursor - Cursor for incremental updates
   * @returns {Promise<Object>} Added, modified, and removed transactions
   */
  syncTransactions: async (userId, cursor = null) => {
    try {
      const response = await plaidApi.post('/plaid/transactions/sync', {
        userId,
        cursor
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  /**
   * Fetches real-time balance information
   * 
   * @param {string} userId - User ID
   * @param {Array<string>} accountIds - Account IDs to fetch balances for
   * @returns {Promise<Array>} Balance data for each account
   */
  getBalances: async (userId, accountIds = []) => {
    try {
      const response = await plaidApi.get('/plaid/balance', {
        params: {
          userId,
          accountIds: accountIds.join(',')
        }
      });
      return response.data.accounts;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  /**
   * Fetches institution details
   * 
   * @param {string} institutionId - Plaid institution ID
   * @returns {Promise<Object>} Institution details
   */
  getInstitution: async (institutionId) => {
    try {
      const response = await plaidApi.get('/plaid/institution', {
        params: { institutionId }
      });
      return response.data.institution;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  /**
   * Removes an account connection
   * 
   * @param {string} userId - User ID
   * @param {string} accountId - Account ID to remove
   * @returns {Promise<Object>} Result of the operation
   */
  removeAccount: async (userId, accountId) => {
    try {
      const response = await plaidApi.delete('/plaid/accounts/remove', {
        data: { userId, accountId }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  /**
   * Updates an account connection via the update mode of Plaid Link
   * 
   * @param {string} userId - User ID
   * @param {string} accessToken - Access token for the account
   * @returns {Promise<string>} Link token for update mode
   */
  createUpdateLinkToken: async (userId, accessToken) => {
    try {
      const response = await plaidApi.post('/plaid/accounts/update', {
        userId,
        accessToken
      });
      return response.data.link_token;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  /**
   * Maps Plaid error codes to user-friendly messages
   * 
   * @param {string} errorCode - Plaid error code
   * @returns {string} User-friendly error message
   */
  getErrorMessage: (errorCode) => {
    const errorMessages = {
      'INVALID_CREDENTIALS': 'The username or password provided is incorrect.',
      'INVALID_MFA': 'The multi-factor authentication response provided is incorrect.',
      'INSTITUTION_DOWN': 'The financial institution is currently unavailable. Please try again later.',
      'RATE_LIMIT_EXCEEDED': 'Too many requests. Please try again later.',
      'ITEM_LOGIN_REQUIRED': 'Your bank requires you to log in again to continue.',
      'PRODUCT_NOT_READY': 'The requested data is not yet ready. Please try again later.',
      'NO_ACCOUNTS': 'No accounts found at this institution.',
      'ITEM_NOT_SUPPORTED': 'This feature is not supported for this account.',
      'INSTITUTION_NOT_FOUND': 'Institution not found.',
      'INTERNAL_SERVER_ERROR': 'An internal server error occurred. Please try again later.',
      'API_ERROR': 'An API error occurred. Please try again later.',
      'ASSET_REPORT_ERROR': 'An error occurred while generating the asset report.',
    };
    
    return errorMessages[errorCode] || 'An unknown error occurred. Please try again later.';
  }
};

export default plaidService; 