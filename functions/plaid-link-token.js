/**
 * Serverless function for creating Plaid link tokens
 */

const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
const corsHandler = require('./utils/cors-handler');
const authHandler = require('./utils/auth-handler');
const { createLogger } = require('./utils/logger');

// Initialize logger
const logger = createLogger('plaid-link-token');

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

// Create a standalone handler that properly handles CORS
exports.handler = async function(event, context) {
  const requestId = event.headers['x-request-id'] || `plaid_${Date.now()}`;
  const origin = event.headers.origin || event.headers.Origin || '*';
  
  // Always handle OPTIONS requests first, before any auth checks
  if (event.httpMethod === "OPTIONS") {
    logger.info('Handling OPTIONS preflight for link-token', { requestId });
    return corsHandler.handleCorsPreflightRequest(event);
  }
  
  logger.info('Received plaid-link-token request', {
    requestId,
    httpMethod: event.httpMethod,
    path: event.path,
    origin,
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
    // Get user from request
    const user = await authHandler.getUserFromRequest(event);
    
    // Check if user is authenticated
    if (!user.isAuthenticated) {
      logger.warn('Unauthorized request', { requestId });
      return corsHandler.createCorsResponse(401, {
        error: "Unauthorized",
        message: "Authentication required for this endpoint",
        requestId
      }, origin);
    }
    
    const userId = user.uid;

    // Validate Plaid configuration
    const plaidConfig = {
      clientId: process.env.PLAID_CLIENT_ID,
      secret: process.env.PLAID_SECRET,
      env: process.env.PLAID_ENV || 'sandbox'
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

    // Prepare link token request
    const request = {
      user: {
        client_user_id: userId,
      },
      client_name: 'Personal Finance Dashboard',
      products: ['auth', 'transactions'],
      language: 'en',
      country_codes: ['US'],
      webhook: `https://api.trypersonalfinance.com/plaid/webhook`,
    };

    // Add redirect URI if available
    const redirectUri = process.env.PLAID_REDIRECT_URI;
    if (redirectUri) {
      request.redirect_uri = redirectUri;
    }

    logger.info('Creating Plaid link token', {
      requestId,
      request: {
        ...request,
        user: { client_user_id: '[REDACTED]' }
      }
    });
    
    // Create the link token
    const createTokenResponse = await plaidClient.linkTokenCreate(request);
    const linkToken = createTokenResponse.data;
    
    logger.info('Successfully created link token', {
      requestId,
      linkToken: {
        expiration: linkToken.expiration,
        requestId: linkToken.request_id
      }
    });
    
    return corsHandler.createCorsResponse(200, {
      ...linkToken,
      requestId,
      environment: plaidConfig.env
    }, origin);
    
  } catch (error) {
    logger.error('Error creating Plaid link token', {
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
      error: "Failed to create link token",
      code: "LINK_TOKEN_ERROR",
      message: error.message || "An unexpected error occurred",
      requestId
    }, origin);
  }
}; 