/**
 * Serverless function for retrieving balance history from Plaid
 */

import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import { validatePlaidConfig, getClientWithToken } from './utils/plaid-client.js';
import { createLogger } from './utils/logger.js';
import corsHandler from './utils/cors-handler.js';
import dbConnector from './utils/db-connector.js';
import retry from './utils/retry.js';
import dotenv from 'dotenv';
import authHandler from './utils/auth-handler.js';

dotenv.config();

const logger = createLogger('plaid-balance-history');

export const handler = async (event) => {
  const requestId = event.headers['x-request-id'] || Date.now().toString();
  const origin = event.headers.origin || event.headers.Origin || '*';

  // Always handle OPTIONS requests first, before any auth checks
  if (event.httpMethod === "OPTIONS") {
    logger.info('Handling OPTIONS preflight for balance-history', { requestId });
    return corsHandler.handleCorsPreflightRequest(event);
  }

  // Log request details
  logger.info('Processing balance history request', {
    requestId,
    method: event.httpMethod,
    path: event.path
  });

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    logger.warn('Invalid request method', {
      requestId,
      method: event.httpMethod
    });
    return corsHandler.createCorsResponse(405, {
      error: 'Method not allowed',
      requestId
    }, origin);
  }

  try {
    // Get user from request (with modified auth handling)
    const user = await authHandler.getUserFromRequest(event);
    
    // Since we're handling auth ourselves, check if user is authenticated
    if (!user.isAuthenticated) {
      logger.warn('Unauthorized request', { requestId });
      return corsHandler.createCorsResponse(401, {
        error: "Unauthorized",
        message: "Authentication required for this endpoint",
        requestId
      }, origin);
    }

    const userId = user.uid;
    const { start_date, end_date } = event.queryStringParameters || {};

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

    // Get user's Plaid items
    const itemsQuery = `
      SELECT plaid_item_id, plaid_access_token, institution_name
      FROM plaid_items
      WHERE user_id = $1 AND status = 'active';
    `;
    const itemsResult = await pool.query(itemsQuery, [userId]);

    if (itemsResult.rows.length === 0) {
      logger.info('No Plaid items found for user', {
        requestId,
        userId
      });
      return corsHandler.createCorsResponse(200, {
        items: [],
        requestId
      }, origin);
    }

    // Get balances for each item
    const balanceHistory = [];
    for (const item of itemsResult.rows) {
      try {
        // Get Plaid client with decrypted access token
        const plaidClient = getClientWithToken(item.plaid_access_token, plaidConfig);

        // Get accounts for this item
        const accountsResponse = await plaidClient.accountsGet({});
        const accounts = accountsResponse.data.accounts;

        // Store balances in history table
        const timestamp = new Date();
        for (const account of accounts) {
          const balanceQuery = `
            INSERT INTO balance_history 
            (user_id, account_type, account_id, balance, is_liability, timestamp, source, metadata)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id;
          `;

          const isLiability = account.type === 'credit' || account.type === 'loan';
          const balanceAmount = isLiability ? -Math.abs(account.balances.current || 0) : (account.balances.current || 0);

          const values = [
            userId,
            account.type,
            account.account_id,
            balanceAmount,
            isLiability,
            timestamp,
            'plaid',
            {
              institution_name: item.institution_name,
              account_name: account.name,
              official_name: account.official_name,
              mask: account.mask,
              subtype: account.subtype,
              available_balance: account.balances.available,
              limit: account.balances.limit,
              iso_currency_code: account.balances.iso_currency_code,
              unofficial_currency_code: account.balances.unofficial_currency_code
            }
          ];

          await pool.query(balanceQuery, values);

          balanceHistory.push({
            account_id: account.account_id,
            account_name: account.name,
            account_type: account.type,
            account_subtype: account.subtype,
            institution_name: item.institution_name,
            balance: balanceAmount,
            available_balance: account.balances.available,
            limit: account.balances.limit,
            mask: account.mask,
            is_liability: isLiability,
            timestamp: timestamp.toISOString()
          });
        }
      } catch (error) {
        logger.error('Error getting balances for item', {
          requestId,
          itemId: item.plaid_item_id,
          error: {
            message: error.message,
            type: error.constructor.name,
            plaidError: error.response?.data || null
          }
        });
        // Continue with other items even if one fails
        continue;
      }
    }

    // Get historical balances from database if date range is provided
    if (start_date && end_date) {
      const historyQuery = `
        SELECT 
          account_id,
          account_type,
          balance,
          is_liability,
          timestamp,
          metadata->>'institution_name' as institution_name,
          metadata->>'account_name' as account_name,
          metadata->>'subtype' as account_subtype,
          metadata->>'mask' as mask,
          metadata->>'available_balance' as available_balance,
          metadata->>'limit' as balance_limit
        FROM balance_history
        WHERE user_id = $1
          AND timestamp BETWEEN $2 AND $3
        ORDER BY timestamp DESC;
      `;

      const historyResult = await pool.query(historyQuery, [userId, start_date, end_date]);
      
      // Add historical balances to the response
      balanceHistory.push(...historyResult.rows.map(row => ({
        account_id: row.account_id,
        account_name: row.account_name,
        account_type: row.account_type,
        account_subtype: row.account_subtype,
        institution_name: row.institution_name,
        balance: row.balance,
        available_balance: row.available_balance ? parseFloat(row.available_balance) : null,
        limit: row.balance_limit ? parseFloat(row.balance_limit) : null,
        mask: row.mask,
        is_liability: row.is_liability,
        timestamp: row.timestamp.toISOString()
      })));
    }

    logger.info('Successfully retrieved balance history', {
      requestId,
      userId,
      balanceCount: balanceHistory.length
    });

    return corsHandler.createCorsResponse(200, {
      balances: balanceHistory,
      requestId
    }, origin);

  } catch (error) {
    logger.error('Error retrieving balance history', {
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
      error: "Failed to retrieve balance history",
      code: "BALANCE_HISTORY_ERROR",
      message: error.message || "An unexpected error occurred",
      requestId
    }, origin);
  }
}; 