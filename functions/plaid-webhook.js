/**
 * Serverless function for handling Plaid webhooks
 */

import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import { validatePlaidConfig, getClientWithToken } from './utils/plaid-client.js';
import { createLogger } from './utils/logger.js';
import corsHandler from './utils/cors-handler.js';
import dbConnector from './utils/db-connector.js';
import retry from './utils/retry.js';
import dotenv from 'dotenv';

dotenv.config();

const logger = createLogger('plaid-webhook');

/**
 * Verify webhook request signature
 */
const verifyWebhookSignature = (body, signatureHeader) => {
  try {
    const webhookSecret = process.env.PLAID_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('PLAID_WEBHOOK_SECRET is not set');
      return false;
    }

    const message = body;
    const receivedSignature = signatureHeader.split(',');
    const receivedSignatureVersion = receivedSignature[0];
    const receivedSignatureTimestamp = receivedSignature[1];
    const receivedSignatureValue = receivedSignature[2];

    if (receivedSignatureVersion !== 'v1') {
      console.error('Unsupported webhook signature version');
      return false;
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(receivedSignatureTimestamp + message)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(receivedSignatureValue)
    );
  } catch (err) {
    console.error('Error verifying webhook signature:', err);
    return false;
  }
};

/**
 * Handle ITEM_ERROR webhook
 */
async function handleItemError(webhook, plaidClient, pool) {
  const { item_id, error } = webhook;

  logger.error('Received ITEM_ERROR webhook', {
    itemId: item_id,
    error: {
      type: error.error_type,
      code: error.error_code,
      message: error.error_message
    }
  });

  // Update item status in database
  const updateQuery = `
    UPDATE plaid_items
    SET status = $1,
        error_code = $2,
        error_message = $3,
        updated_at = CURRENT_TIMESTAMP
    WHERE plaid_item_id = $4
    RETURNING id;
  `;

  await pool.query(updateQuery, [
    'error',
    error.error_code,
    error.error_message,
    item_id
  ]);
}

/**
 * Handle SYNC_UPDATES_AVAILABLE webhook
 */
async function handleSyncUpdates(webhook, plaidClient, pool) {
  const { item_id, initial_update_complete, historical_update_complete } = webhook;

  logger.info('Received SYNC_UPDATES_AVAILABLE webhook', {
    itemId: item_id,
    initial_update_complete,
    historical_update_complete
  });

  // Get item from database
  const itemQuery = `
    SELECT id, user_id, plaid_access_token
    FROM plaid_items
    WHERE plaid_item_id = $1 AND status = 'active';
  `;
  
  const itemResult = await pool.query(itemQuery, [item_id]);
  if (itemResult.rows.length === 0) {
    logger.warn('Item not found or inactive', { itemId: item_id });
    return;
  }

  const item = itemResult.rows[0];

  // Trigger transaction sync
  try {
    const syncResponse = await retry(
      () => plaidClient.transactionsSync({
        access_token: item.plaid_access_token,
        cursor: null
      }),
      {
        maxRetries: 3,
        initialDelay: 1000,
        shouldRetry: (error) => {
          return error.response?.status === 429 || 
                 error.code === 'PLAID_ERROR';
        }
      }
    );

    // Store sync results
    const syncQuery = `
      INSERT INTO sync_events (
        user_id,
        plaid_item_id,
        event_type,
        added_count,
        modified_count,
        removed_count,
        next_cursor
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id;
    `;

    await pool.query(syncQuery, [
      item.user_id,
      item_id,
      'SYNC_UPDATES_AVAILABLE',
      syncResponse.data.added.length,
      syncResponse.data.modified.length,
      syncResponse.data.removed.length,
      syncResponse.data.next_cursor
    ]);

    logger.info('Successfully processed sync updates', {
      itemId: item_id,
      added: syncResponse.data.added.length,
      modified: syncResponse.data.modified.length,
      removed: syncResponse.data.removed.length
    });

  } catch (error) {
    logger.error('Error processing sync updates', {
      itemId: item_id,
      error: {
        message: error.message,
        type: error.constructor.name,
        plaidError: error.response?.data || null
      }
    });
    throw error;
  }
}

/**
 * Handle TRANSACTIONS_REMOVED webhook
 */
async function handleTransactionsRemoved(webhook, plaidClient, pool) {
  const { item_id, removed_transactions } = webhook;

  logger.info('Received TRANSACTIONS_REMOVED webhook', {
    itemId: item_id,
    removedCount: removed_transactions.length
  });

  // Update transactions in database
  const updateQuery = `
    UPDATE transactions
    SET status = 'removed',
        updated_at = CURRENT_TIMESTAMP
    WHERE plaid_transaction_id = ANY($1)
    RETURNING id;
  `;

  const result = await pool.query(updateQuery, [removed_transactions]);
  
  logger.info('Updated removed transactions', {
    itemId: item_id,
    updatedCount: result.rowCount
  });
}

// Handle different webhook types
const handleTransactionsWebhook = async (webhookData) => {
  console.log('Received transactions webhook:', webhookData);
  // TODO: Implement transaction sync logic
};

const handleItemWebhook = async (webhookData) => {
  console.log('Received item webhook:', webhookData);
  // TODO: Implement item status update logic
};

const handleWalletWebhook = async (webhookData) => {
  console.log('Received wallet webhook:', webhookData);
  // TODO: Implement wallet transaction handling
};

const handleIncomeWebhook = async (webhookData) => {
  console.log('Received income webhook:', webhookData);
  // TODO: Implement income refresh handling
};

export const handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse webhook data
    const body = event.body;
    const webhookData = JSON.parse(body);
    console.log('Received webhook:', webhookData);

    // In development, we'll skip signature verification
    if (process.env.NODE_ENV === 'production') {
      const signatureHeader = event.headers['plaid-verification'];
      if (!signatureHeader) {
        console.error('No Plaid signature found in headers');
        return {
          statusCode: 401,
          body: JSON.stringify({ error: 'Missing signature header' }),
        };
      }

      // Only verify in production if we have a webhook secret
      if (process.env.PLAID_WEBHOOK_SECRET) {
        const isValid = verifyWebhookSignature(body, signatureHeader);
        if (!isValid) {
          console.error('Invalid webhook signature');
          return {
            statusCode: 401,
            body: JSON.stringify({ error: 'Invalid signature' }),
          };
        }
      }
    }

    // Handle different webhook types
    switch (webhookData.webhook_type) {
      case 'TRANSACTIONS':
        await handleTransactionsWebhook(webhookData);
        break;
      case 'ITEM':
        await handleItemWebhook(webhookData);
        break;
      case 'INCOME':
        await handleIncomeWebhook(webhookData);
        break;
      case 'WALLET':
        await handleWalletWebhook(webhookData);
        break;
      default:
        console.log(`Unhandled webhook type: ${webhookData.webhook_type}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
    };
  } catch (error) {
    console.error('Error processing webhook:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
}; 