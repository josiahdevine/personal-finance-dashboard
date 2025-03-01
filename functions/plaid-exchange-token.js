/**
 * Serverless function for exchanging Plaid public tokens for access tokens
 */

const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
const corsHandler = require('./utils/cors-handler');
const authHandler = require('./utils/auth-handler');
const { createLogger } = require('./utils/logger');
const { encrypt } = require('./utils/encryption-utils');
const dbConnector = require('./utils/db-connector');

// Initialize logger
const logger = createLogger('plaid-exchange-token');

// Validate request body
function validateRequestBody(body) {
  const errors = [];
  
  if (!body.public_token) {
    errors.push('Missing public_token');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Validate Plaid configuration
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

// Initialize Plaid client with configuration
function initializePlaidClient(config) {
  const { clientId, secret, env } = config;
  
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

// Export the handler with authentication middleware
exports.handler = authHandler.requireAuth(async function(event, context) {
  const requestId = event.headers['x-request-id'] || Date.now().toString();
  const origin = event.headers.origin || event.headers.Origin || '*';
  
  logger.info('Received plaid-exchange-token request', {
    requestId,
    httpMethod: event.httpMethod,
    path: event.path,
    origin,
    userId: event.user.uid,
    environment: process.env.NODE_ENV
  });

  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    logger.warn('Method not allowed', {
      requestId,
      method: event.httpMethod
    });
    return corsHandler.createCorsResponse(405, {
      error: "Method not allowed",
      code: "METHOD_NOT_ALLOWED",
      requestId
    }, origin);
  }

  try {
    // Parse and validate request body
    const data = JSON.parse(event.body || '{}');
    const userId = event.user.uid;

    // Validate request body
    const bodyValidation = validateRequestBody(data);
    if (!bodyValidation.isValid) {
      logger.error('Invalid request body', {
        requestId,
        errors: bodyValidation.errors
      });
      return corsHandler.createCorsResponse(400, {
        error: "Invalid request",
        message: "Invalid request body",
        details: bodyValidation.errors,
        code: "INVALID_REQUEST",
        requestId
      }, origin);
    }

    // Validate Plaid configuration
    const plaidConfig = {
      clientId: process.env.PLAID_CLIENT_ID || process.env.REACT_APP_PLAID_CLIENT_ID,
      secret: process.env.PLAID_SECRET || process.env.REACT_APP_PLAID_SECRET,
      env: process.env.PLAID_ENV || process.env.REACT_APP_PLAID_ENV || 'sandbox'
    };

    const configValidation = validatePlaidConfig(plaidConfig);
    if (!configValidation.isValid) {
      logger.error('Invalid Plaid configuration', {
        requestId,
        errors: configValidation.errors
      });
      return corsHandler.createCorsResponse(500, {
        error: "Configuration error",
        message: "Invalid Plaid configuration",
        details: configValidation.errors,
        code: "INVALID_PLAID_CONFIG",
        requestId
      }, origin);
    }

    logger.info('Initializing Plaid client', {
      requestId,
      environment: plaidConfig.env,
      userId
    });

    const plaidClient = initializePlaidClient(plaidConfig);

    // Exchange the public token
    logger.info('Exchanging public token', {
      requestId,
      userId,
      hasPublicToken: !!data.public_token
    });
    
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token: data.public_token
    });

    const accessToken = exchangeResponse.data.access_token;
    const itemId = exchangeResponse.data.item_id;

    // Get the master encryption key from environment
    const masterKey = process.env.ENCRYPTION_MASTER_KEY;
    if (!masterKey) {
      logger.error('Missing encryption master key', { requestId });
      return corsHandler.createCorsResponse(500, {
        error: "Configuration error",
        message: "Missing encryption configuration",
        code: "MISSING_ENCRYPTION_KEY",
        requestId
      }, origin);
    }

    // Encrypt the access token
    const encryptedAccessToken = encrypt(accessToken, masterKey);

    // Get database connection
    const pool = dbConnector.getDbPool();
    if (!pool) {
      logger.error('Failed to get database connection', { requestId });
      return corsHandler.createCorsResponse(500, {
        error: "Database error",
        message: "Failed to connect to database",
        code: "DB_CONNECTION_ERROR",
        requestId
      }, origin);
    }

    // Store the encrypted access token in the database
    const query = `
      INSERT INTO plaid_items 
      (user_id, plaid_item_id, plaid_access_token, plaid_institution_id, institution_name, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (plaid_item_id) 
      DO UPDATE SET 
        plaid_access_token = EXCLUDED.plaid_access_token,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id;
    `;

    const values = [
      userId,
      itemId,
      encryptedAccessToken,
      data.institution?.institution_id || 'unknown',
      data.institution?.name || 'Unknown Institution',
      'active'
    ];

    await pool.query(query, values);
    
    logger.info('Successfully stored encrypted access token', {
      requestId,
      userId,
      itemId,
      hasAccessToken: true
    });
    
    return corsHandler.createCorsResponse(200, {
      status: 'success',
      item_id: itemId,
      request_id: exchangeResponse.data.request_id,
      environment: plaidConfig.env,
      requestId
    }, origin);
    
  } catch (error) {
    logger.error('Error exchanging public token', {
      requestId,
      error: {
        message: error.message,
        type: error.constructor.name,
        plaidError: error.response?.data || null
      }
    });
    
    // Handle specific Plaid API errors
    if (error.response?.data) {
      const plaidError = error.response.data;
      return corsHandler.createCorsResponse(error.response.status || 500, {
        error: "Plaid API error",
        code: plaidError.error_code || "PLAID_API_ERROR",
        message: plaidError.error_message || "An error occurred with the Plaid API",
        details: plaidError,
        requestId
      }, origin);
    }
    
    // Handle other errors
    return corsHandler.createCorsResponse(500, {
      error: "Failed to exchange token",
      code: "TOKEN_EXCHANGE_ERROR",
      message: error.message || "An unexpected error occurred",
      requestId
    }, origin);
  }
}, { corsHandler }); 