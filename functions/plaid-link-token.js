/**
 * Serverless function for creating Plaid link tokens
 */

import { 
  getPlaidClient, 
  getPlaidConfig, 
  createSuccessResponse, 
  createErrorResponse 
} from './utils/plaid-client.js';
import corsHandler from './utils/cors-handler.js';
import authHandler from './utils/auth-handler.js';
import { createLogger } from './utils/logger.js';

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
export const handler = async function(event, context) {
  const origin = event.headers.origin || '*';
  const requestId = event.headers['x-request-id'] || `req_${Date.now()}`;

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return corsHandler.createPreflightResponse(origin);
  }

  try {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
      return createErrorResponse(405, { message: 'Method not allowed' });
    }

    // Get user from request
    const user = await authHandler.getUserFromRequest(event);
    
    // Check if user is authenticated
    if (!user.isAuthenticated) {
      logger.warn('Unauthorized request', { requestId });
      return createErrorResponse(401, { 
        message: 'Authentication required for this endpoint',
        code: 'UNAUTHORIZED'
      });
    }

    logger.info('Creating Plaid link token', {
      requestId,
      userId: user.uid
    });

    const plaidClient = getPlaidClient();
    const config = getPlaidConfig();

    // Prepare link token request
    const request = {
      user: {
        client_user_id: user.uid,
      },
      client_name: 'Personal Finance Dashboard',
      products: config.products,
      country_codes: config.countryCodes,
      language: config.language,
      webhook: config.webhookUrl,
    };

    // Add redirect URI if configured
    if (config.redirectUri) {
      request.redirect_uri = config.redirectUri;
    }

    const createTokenResponse = await plaidClient.linkTokenCreate(request);
    
    logger.info('Link token created successfully', {
      requestId,
      userId: user.uid,
      linkTokenExpiration: createTokenResponse.data.expiration
    });

    return createSuccessResponse(createTokenResponse.data, requestId);
  } catch (error) {
    logger.error('Failed to create link token', {
      requestId,
      error: {
        message: error.message,
        type: error.constructor.name
      }
    });

    return createErrorResponse(500, error, requestId);
  }
}; 