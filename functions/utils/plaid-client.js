/**
 * Centralized Plaid client utility
 */
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import { createLogger } from './logger.js';

const logger = createLogger('plaid-client');

/**
 * Default Plaid configuration
 */
const DEFAULT_CONFIG = {
  env: 'sandbox',
  version: '2020-09-14',
  products: ['auth', 'transactions'],
  countryCodes: ['US'],
  language: 'en',
  timeout: 30000
};

/**
 * Validates Plaid configuration
 */
function validatePlaidConfig(config) {
  const errors = [];
  
  if (!config.clientId) errors.push('Missing PLAID_CLIENT_ID');
  if (!config.secret) errors.push('Missing PLAID_SECRET');
  if (!config.env || !Object.keys(PlaidEnvironments).includes(config.env)) {
    errors.push(`Invalid PLAID_ENV: ${config.env}. Must be one of: ${Object.keys(PlaidEnvironments).join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Gets Plaid configuration from environment
 */
function getPlaidConfig() {
  return {
    clientId: process.env.PLAID_CLIENT_ID || process.env.REACT_APP_PLAID_CLIENT_ID,
    secret: process.env.PLAID_SECRET || process.env.REACT_APP_PLAID_SECRET,
    env: process.env.PLAID_ENV || process.env.REACT_APP_PLAID_ENV || DEFAULT_CONFIG.env,
    webhookUrl: process.env.PLAID_WEBHOOK_URL,
    redirectUri: process.env.PLAID_REDIRECT_URI,
    version: DEFAULT_CONFIG.version,
    products: (process.env.PLAID_PRODUCTS || DEFAULT_CONFIG.products.join(',')).split(','),
    countryCodes: (process.env.PLAID_COUNTRY_CODES || DEFAULT_CONFIG.countryCodes.join(',')).split(','),
    language: process.env.PLAID_LANGUAGE || DEFAULT_CONFIG.language,
    timeout: parseInt(process.env.PLAID_TIMEOUT) || DEFAULT_CONFIG.timeout
  };
}

// Singleton instance
let plaidClientInstance = null;

/**
 * Creates or returns existing Plaid client instance
 */
function getPlaidClient() {
  if (plaidClientInstance) {
    return plaidClientInstance;
  }

  const config = getPlaidConfig();
  const validation = validatePlaidConfig(config);

  if (!validation.isValid) {
    logger.error('Invalid Plaid configuration', { errors: validation.errors });
    throw new Error(`Invalid Plaid configuration: ${validation.errors.join(', ')}`);
  }

  const configuration = new Configuration({
    basePath: PlaidEnvironments[config.env],
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': config.clientId,
        'PLAID-SECRET': config.secret,
        'Plaid-Version': config.version,
      },
      timeout: config.timeout,
    },
  });

  plaidClientInstance = new PlaidApi(configuration);
  
  logger.info('Plaid client initialized', {
    environment: config.env,
    products: config.products,
    countryCodes: config.countryCodes
  });

  return plaidClientInstance;
}

/**
 * Creates standard CORS headers for Plaid responses
 */
function createPlaidResponseHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-Requested-With, Accept, Origin, X-Api-Key, X-Environment, X-Request-ID',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };
}

/**
 * Creates a standardized error response
 */
function createErrorResponse(statusCode, error, requestId = null) {
  return {
    statusCode,
    body: JSON.stringify({
      error: error.message || 'An error occurred',
      code: error.code || 'INTERNAL_ERROR',
      requestId
    }),
    headers: createPlaidResponseHeaders()
  };
}

/**
 * Creates a standardized success response
 */
function createSuccessResponse(data, requestId = null) {
  return {
    statusCode: 200,
    body: JSON.stringify({ data, requestId }),
    headers: createPlaidResponseHeaders()
  };
}

/**
 * Gets a Plaid client instance with an access token
 */
function getClientWithToken(accessToken) {
  const client = getPlaidClient();
  client.accessToken = accessToken;
  return client;
}

export {
  getPlaidClient,
  getPlaidConfig,
  validatePlaidConfig,
  createPlaidResponseHeaders,
  createErrorResponse,
  createSuccessResponse,
  DEFAULT_CONFIG,
  getClientWithToken
}; 