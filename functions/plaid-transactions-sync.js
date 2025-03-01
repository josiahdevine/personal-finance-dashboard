/**
 * Serverless function for syncing transactions from Plaid
 * Implements automatic retry and rate limiting
 */

const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
const corsHandler = require('./utils/cors-handler');
const authHandler = require('./utils/auth-handler');
const { createLogger } = require('./utils/logger');
const { validatePlaidConfig, getClientWithToken } = require('./utils/plaid-client');
const dbConnector = require('./utils/db-connector');
const rateLimit = require('./utils/rate-limit');
const retry = require('./utils/retry');

// Initialize logger
const logger = createLogger('plaid-transactions-sync');

// Constants for transaction sync
const SYNC_PAGE_SIZE = 100;
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

/**
 * Validate request parameters
 */
function validateRequestParams(params) {
  const errors = [];
  const now = new Date();
  const oneYearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
  
  if (params.start_date) {
    const startDate = new Date(params.start_date);
    if (isNaN(startDate.getTime()) || startDate < oneYearAgo) {
      errors.push('start_date must be within the last year and be a valid date');
    }
  }
  
  if (params.end_date) {
    const endDate = new Date(params.end_date);
    if (isNaN(endDate.getTime()) || endDate > now) {
      errors.push('end_date must not be in the future and be a valid date');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Store transactions in database
 */
async function storeTransactions(pool, userId, transactions, itemId) {
  const query = `
    INSERT INTO transactions (
      user_id,
      plaid_transaction_id,
      plaid_item_id,
      account_id,
      amount,
      category,
      date,
      merchant_name,
      payment_channel,
      pending,
      metadata
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    ON CONFLICT (plaid_transaction_id) 
    DO UPDATE SET
      amount = EXCLUDED.amount,
      category = EXCLUDED.category,
      merchant_name = EXCLUDED.merchant_name,
      pending = EXCLUDED.pending,
      metadata = EXCLUDED.metadata,
      updated_at = CURRENT_TIMESTAMP
    RETURNING id;
  `;

  for (const transaction of transactions) {
    try {
      await pool.query(query, [
        userId,
        transaction.transaction_id,
        itemId,
        transaction.account_id,
        transaction.amount,
        transaction.category,
        transaction.date,
        transaction.merchant_name,
        transaction.payment_channel,
        transaction.pending,
        {
          location: transaction.location,
          payment_meta: transaction.payment_meta,
          name: transaction.name,
          original_description: transaction.original_description,
          account_owner: transaction.account_owner,
          iso_currency_code: transaction.iso_currency_code,
          unofficial_currency_code: transaction.unofficial_currency_code
        }
      ]);
    } catch (error) {
      logger.error('Error storing transaction', {
        transactionId: transaction.transaction_id,
        error: error.message
      });
      // Continue with other transactions even if one fails
      continue;
    }
  }
}

/**
 * Sync transactions for a specific Plaid item
 */
async function syncTransactionsForItem(plaidClient, pool, userId, item, requestId) {
  let hasMore = true;
  let cursor = null;
  const added = [];
  const modified = [];
  const removed = [];
  let retryCount = 0;

  while (hasMore) {
    try {
      const syncResponse = await retry(
        () => plaidClient.transactionsSync({
          cursor: cursor,
          count: SYNC_PAGE_SIZE
        }),
        {
          maxRetries: MAX_RETRIES,
          initialDelay: INITIAL_RETRY_DELAY,
          shouldRetry: (error) => {
            // Retry on rate limit errors or network issues
            return error.response?.status === 429 || 
                   error.code === 'PLAID_ERROR' ||
                   error.code === 'NETWORK_ERROR';
          }
        }
      );

      const data = syncResponse.data;
      
      added.push(...data.added);
      modified.push(...data.modified);
      removed.push(...data.removed);
      
      hasMore = data.has_more;
      cursor = data.next_cursor;

      // Store new and modified transactions
      if (data.added.length > 0 || data.modified.length > 0) {
        await storeTransactions(pool, userId, [...data.added, ...data.modified], item.plaid_item_id);
      }

      // Handle removed transactions
      if (data.removed.length > 0) {
        const removedIds = data.removed.map(t => t.transaction_id);
        await pool.query(
          'UPDATE transactions SET status = $1 WHERE plaid_transaction_id = ANY($2)',
          ['removed', removedIds]
        );
      }

      // Update cursor in database
      await pool.query(
        'UPDATE plaid_items SET transactions_cursor = $1 WHERE id = $2',
        [cursor, item.id]
      );

      logger.info('Synced transactions batch', {
        requestId,
        itemId: item.plaid_item_id,
        added: data.added.length,
        modified: data.modified.length,
        removed: data.removed.length,
        hasMore
      });

    } catch (error) {
      logger.error('Error syncing transactions', {
        requestId,
        itemId: item.plaid_item_id,
        error: {
          message: error.message,
          type: error.constructor.name,
          plaidError: error.response?.data || null
        },
        retryCount
      });

      throw error;
    }
  }

  return {
    added: added.length,
    modified: modified.length,
    removed: removed.length
  };
}

// Export the handler with authentication middleware
exports.handler = authHandler.requireAuth(async function(event, context) {
  const requestId = event.headers['x-request-id'] || Date.now().toString();
  const origin = event.headers.origin || event.headers.Origin || '*';

  logger.info('Processing transaction sync request', {
    requestId,
    method: event.httpMethod,
    path: event.path,
    authenticated: !!event.user
  });

  // Apply rate limiting
  const rateLimitResult = await rateLimit.checkLimit(event.user.uid, 'transactions_sync', {
    maxRequests: 10,
    windowMs: 60000 // 1 minute
  });

  if (!rateLimitResult.allowed) {
    logger.warn('Rate limit exceeded', {
      requestId,
      userId: event.user.uid,
      nextAllowedAt: rateLimitResult.nextAllowedAt
    });
    return corsHandler.createCorsResponse(429, {
      error: "Too many requests",
      code: "RATE_LIMIT_EXCEEDED",
      message: "Please try again later",
      nextAllowedAt: rateLimitResult.nextAllowedAt,
      requestId
    }, origin);
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return corsHandler.createCorsResponse(405, {
      error: "Method not allowed",
      code: "METHOD_NOT_ALLOWED",
      requestId
    }, origin);
  }

  try {
    const userId = event.user.uid;
    const params = JSON.parse(event.body || '{}');

    // Validate request parameters
    const validation = validateRequestParams(params);
    if (!validation.isValid) {
      return corsHandler.createCorsResponse(400, {
        error: "Invalid parameters",
        code: "INVALID_PARAMETERS",
        details: validation.errors,
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
      return corsHandler.createCorsResponse(500, {
        error: "Configuration error",
        code: "INVALID_PLAID_CONFIG",
        details: configValidation.errors,
        requestId
      }, origin);
    }

    // Get database connection
    const pool = dbConnector.getDbPool();
    if (!pool) {
      return corsHandler.createCorsResponse(500, {
        error: "Database error",
        code: "DB_CONNECTION_ERROR",
        message: "Failed to connect to database",
        requestId
      }, origin);
    }

    // Get user's Plaid items
    const itemsQuery = `
      SELECT id, plaid_item_id, plaid_access_token, institution_name, transactions_cursor
      FROM plaid_items
      WHERE user_id = $1 AND status = 'active';
    `;
    const itemsResult = await pool.query(itemsQuery, [userId]);

    if (itemsResult.rows.length === 0) {
      return corsHandler.createCorsResponse(200, {
        message: "No Plaid items found",
        items: [],
        requestId
      }, origin);
    }

    const results = [];
    for (const item of itemsResult.rows) {
      try {
        // Get Plaid client with decrypted access token
        const plaidClient = getClientWithToken(item.plaid_access_token, plaidConfig);

        // Sync transactions for this item
        const syncResult = await syncTransactionsForItem(plaidClient, pool, userId, item, requestId);
        
        results.push({
          item_id: item.plaid_item_id,
          institution_name: item.institution_name,
          ...syncResult
        });

      } catch (error) {
        logger.error('Error processing item', {
          requestId,
          itemId: item.plaid_item_id,
          error: {
            message: error.message,
            type: error.constructor.name,
            plaidError: error.response?.data || null
          }
        });
        
        // Add failed item to results
        results.push({
          item_id: item.plaid_item_id,
          institution_name: item.institution_name,
          error: {
            code: error.response?.data?.error_code || 'SYNC_ERROR',
            message: error.response?.data?.error_message || error.message
          }
        });
        
        // Continue with other items even if one fails
        continue;
      }
    }

    return corsHandler.createCorsResponse(200, {
      status: 'success',
      results,
      requestId
    }, origin);

  } catch (error) {
    logger.error('Error in transaction sync', {
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
      error: "Failed to sync transactions",
      code: "SYNC_ERROR",
      message: error.message || "An unexpected error occurred",
      requestId
    }, origin);
  }
}, { corsHandler }); 