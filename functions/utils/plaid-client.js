/**
 * Plaid client utility for Netlify Functions
 */

const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
const { decrypt } = require('./encryption-utils');
const { createLogger } = require('./logger');

// Initialize logger
const logger = createLogger('plaid-client');

/**
 * Validates Plaid configuration
 * @param {Object} config - Plaid configuration object
 * @param {string} config.clientId - Plaid client ID
 * @param {string} config.secret - Plaid secret
 * @param {string} config.env - Plaid environment (sandbox, development, production)
 * @returns {Object} Validation result
 */
function validatePlaidConfig(config) {
  const { clientId, secret, env } = config;
  const errors = [];

  if (!clientId) errors.push('Missing PLAID_CLIENT_ID');
  if (!secret) errors.push('Missing PLAID_SECRET');
  if (!env || !Object.keys(PlaidEnvironments).includes(env)) {
    errors.push(`Invalid PLAID_ENV: ${env}. Must be one of: ${Object.keys(PlaidEnvironments).join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Initializes Plaid client with configuration
 * @param {Object} config - Plaid configuration object
 * @param {string} config.clientId - Plaid client ID
 * @param {string} config.secret - Plaid secret
 * @param {string} config.env - Plaid environment (sandbox, development, production)
 * @returns {PlaidApi} Configured Plaid client
 */
function initializePlaidClient(config) {
  const { clientId, secret, env } = config;
  
  // Log initialization (without sensitive data)
  logger.info('Initializing Plaid client', {
    environment: env,
    hasClientId: !!clientId,
    hasSecret: !!secret
  });
  
  const configuration = new Configuration({
    basePath: PlaidEnvironments[env],
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': clientId,
        'PLAID-SECRET': secret,
        'PLAID-VERSION': '2020-09-14',
      },
    },
  });
  
  return new PlaidApi(configuration);
}

/**
 * Gets Plaid configuration from environment variables
 * @returns {Object} Plaid configuration object
 */
function getPlaidConfig() {
  const config = {
    clientId: process.env.PLAID_CLIENT_ID || process.env.REACT_APP_PLAID_CLIENT_ID,
    secret: process.env.PLAID_SECRET || process.env.REACT_APP_PLAID_SECRET,
    env: process.env.PLAID_ENV || process.env.REACT_APP_PLAID_ENV || 'sandbox'
  };

  // Log configuration status (without sensitive data)
  logger.info('Plaid configuration loaded', {
    environment: config.env,
    hasClientId: !!config.clientId,
    hasSecret: !!config.secret
  });

  return config;
}

/**
 * Get a Plaid client instance with the encrypted access token
 * @param {string} encryptedAccessToken - Encrypted access token from database
 * @param {Object} config - Plaid configuration object
 * @returns {PlaidApi} Plaid client instance with decrypted access token
 */
function getClientWithToken(encryptedAccessToken, config) {
  try {
    // Get master encryption key
    const masterKey = process.env.ENCRYPTION_MASTER_KEY;
    if (!masterKey) {
      throw new Error('Missing encryption master key');
    }

    // Decrypt the access token
    const accessToken = decrypt(encryptedAccessToken, masterKey);

    // Initialize Plaid client
    const client = initializePlaidClient(config);

    // Return a proxy that automatically adds the access token to requests
    return new Proxy(client, {
      get(target, prop) {
        if (typeof target[prop] === 'function') {
          return async (...args) => {
            // If the first argument is an object, add the access token
            if (args.length > 0 && typeof args[0] === 'object') {
              args[0] = { ...args[0], access_token: accessToken };
            }
            return target[prop].apply(target, args);
          };
        }
        return target[prop];
      }
    });
  } catch (error) {
    logger.error('Failed to initialize Plaid client with token', {
      error: {
        message: error.message,
        type: error.constructor.name
      }
    });
    throw error;
  }
}

module.exports = {
  validatePlaidConfig,
  initializePlaidClient,
  getPlaidConfig,
  getClientWithToken
}; 