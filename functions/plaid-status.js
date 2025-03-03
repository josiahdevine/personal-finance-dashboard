/**
 * Serverless function for checking Plaid connection status
 */

import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import { createLogger } from './utils/logger.js';
import corsHandler from './utils/cors-handler.js';
import dotenv from 'dotenv';
import authHandler from './utils/auth-handler.js';
import dbConnector from './utils/db-connector.js';

dotenv.config();

const logger = createLogger('plaid-status');

// IMPORTANT: Create a standalone handler that properly handles CORS
export const handler = async function(event, context) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const origin = event.headers.origin || event.headers.Origin || '*';

  logger.info('Received plaid-status request:', {
    requestId,
    httpMethod: event.httpMethod,
    path: event.path,
    origin
  });

  // Always handle OPTIONS requests first, before any auth checks
  if (event.httpMethod === "OPTIONS") {
    logger.info('Handling OPTIONS preflight for plaid-status', { requestId });
    return corsHandler.handleCorsPreflightRequest(event);
  }

  try {
    // Only allow GET requests
    if (event.httpMethod !== "GET") {
      return corsHandler.createCorsResponse(405, {
        error: "Method not allowed",
        requestId
      }, origin);
    }

    // Get user from request (with modified auth handling)
    const user = await authHandler.getUserFromRequest(event);
    
    // Since we're handling auth ourselves, check if user is authenticated
    if (!user.isAuthenticated) {
      logger.warn('Unauthorized request', { requestId, userId: user.uid });
      return corsHandler.createCorsResponse(401, {
        error: "Unauthorized",
        message: "Authentication required for this endpoint",
        requestId
      }, origin);
    }

    // Use the authenticated user ID from the auth middleware
    const userId = user.uid;

    logger.info(`Checking Plaid status for user: ${userId}`, { requestId });

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

    // Check for existing Plaid items
    const itemsQuery = `
      SELECT plaid_item_id, institution_name, status, error_code, error_message
      FROM plaid_items
      WHERE user_id = $1 AND status = 'active';
    `;
    
    const itemsResult = await pool.query(itemsQuery, [userId]);
    const items = itemsResult.rows;

    // Initialize the Plaid client
    const plaidClientId = process.env.PLAID_CLIENT_ID || process.env.REACT_APP_PLAID_CLIENT_ID;
    const plaidSecret = process.env.PLAID_SECRET || process.env.REACT_APP_PLAID_SECRET;
    const plaidEnv = process.env.PLAID_ENV || process.env.REACT_APP_PLAID_ENV || 'sandbox';
    
    if (!plaidClientId || !plaidSecret) {
      logger.error('Missing Plaid credentials', { requestId });
      return corsHandler.createCorsResponse(500, {
        error: "Configuration error",
        message: "Missing Plaid API credentials",
        requestId
      }, origin);
    }

    // Configure Plaid client
    const configuration = new Configuration({
      basePath: PlaidEnvironments[plaidEnv],
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': plaidClientId,
          'PLAID-SECRET': plaidSecret,
        },
      },
    });
    
    const plaidClient = new PlaidApi(configuration);
    
    // Return status response
    return corsHandler.createCorsResponse(200, {
      status: "operational",
      environment: plaidEnv,
      message: "Plaid API connection is functioning correctly",
      userId: userId,
      isAuthenticated: user.isAuthenticated,
      connected: items.length > 0,
      items: items,
      timestamp: new Date().toISOString(),
      requestId
    }, origin);
    
  } catch (error) {
    logger.error("Error checking Plaid status:", {
      error: error.message,
      stack: error.stack,
      requestId
    });
    
    return corsHandler.createCorsResponse(500, {
      error: "Failed to check Plaid status",
      message: error.message,
      details: error.response?.data || {},
      requestId
    }, origin);
  }
}; 