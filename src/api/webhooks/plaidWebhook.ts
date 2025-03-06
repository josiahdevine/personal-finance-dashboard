import { Request, Response } from 'express';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import { pool } from '../db';
import { TokenStorage } from '../utils/tokenStorage';

const plaidClient = new PlaidApi(
  new Configuration({
    basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID!,
        'PLAID-SECRET': process.env.PLAID_SECRET!,
      },
    },
  })
);

export const handlePlaidWebhook = async (req: Request, res: Response) => {
  try {
    const {
      webhook_type: webhookType,
      webhook_code: webhookCode,
      item_id: itemId,
    } = req.body;

    // Verify webhook authenticity (in production)
    if (process.env.NODE_ENV === 'production') {
      // Implement webhook verification using Plaid's signature verification
      // https://plaid.com/docs/api/webhooks/webhook-verification/
    }

    // Log webhook for debugging
    console.log('Received Plaid webhook:', {
      webhookType,
      webhookCode,
      itemId,
      timestamp: new Date().toISOString(),
    });

    // Get the account associated with this item
    const result = await pool.query(
      `SELECT * FROM plaid_accounts WHERE item_id = $1`,
      [itemId]
    );

    if (result.rows.length === 0) {
      console.error('No account found for item_id:', itemId);
      return res.status(404).json({ message: 'Account not found' });
    }

    const account = result.rows[0];
    const { access_token, access_token_iv, access_token_tag } = account;
    const accessToken = TokenStorage.decrypt(
      access_token,
      access_token_iv,
      access_token_tag
    );

    switch (webhookType) {
      case 'TRANSACTIONS':
        await handleTransactionsWebhook(webhookCode, accessToken, account);
        break;

      case 'ITEM':
        await handleItemWebhook(webhookCode, accessToken, account);
        break;

      case 'AUTH':
        await handleAuthWebhook(webhookCode, accessToken, account);
        break;

      default:
        console.log('Unhandled webhook type:', webhookType);
    }

    res.json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ message: 'Failed to process webhook' });
  }
};

async function handleTransactionsWebhook(
  webhookCode: string,
  accessToken: string,
  account: any
) {
  switch (webhookCode) {
    case 'INITIAL_UPDATE':
    case 'HISTORICAL_UPDATE':
    case 'DEFAULT_UPDATE':
      // Sync new transactions
      const response = await plaidClient.transactionsSync({
        access_token: accessToken,
      });

      // Store new transactions in the database
      await storeTransactions(response.data, account.user_id);
      break;

    case 'TRANSACTIONS_REMOVED':
      // Handle removed transactions
      // Implement transaction removal logic
      break;

    default:
      console.log('Unhandled transactions webhook code:', webhookCode);
  }
}

async function handleItemWebhook(
  webhookCode: string,
  accessToken: string,
  account: any
) {
  switch (webhookCode) {
    case 'ERROR':
      // Log the error and potentially notify the user
      console.error('Plaid item error:', account);
      break;

    case 'PENDING_EXPIRATION':
      // Notify user that they need to re-authenticate
      // Implement user notification logic
      break;

    default:
      console.log('Unhandled item webhook code:', webhookCode);
  }
}

async function handleAuthWebhook(
  webhookCode: string,
  accessToken: string,
  account: any
) {
  switch (webhookCode) {
    case 'AUTOMATICALLY_VERIFIED':
    case 'VERIFICATION_EXPIRED':
      // Update account verification status
      await updateAccountVerificationStatus(account.id, webhookCode);
      break;

    default:
      console.log('Unhandled auth webhook code:', webhookCode);
  }
}

async function storeTransactions(
  syncResponse: any,
  userId: string
) {
  // Begin transaction
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Store added transactions
    for (const transaction of syncResponse.added) {
      await client.query(
        `
        INSERT INTO transactions (
          user_id,
          transaction_id,
          account_id,
          amount,
          date,
          name,
          category,
          pending
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (transaction_id) DO NOTHING
        `,
        [
          userId,
          transaction.transaction_id,
          transaction.account_id,
          transaction.amount,
          transaction.date,
          transaction.name,
          transaction.category?.[0],
          transaction.pending,
        ]
      );
    }

    // Handle modified transactions
    for (const transaction of syncResponse.modified) {
      await client.query(
        `
        UPDATE transactions
        SET
          amount = $1,
          date = $2,
          name = $3,
          category = $4,
          pending = $5,
          updated_at = CURRENT_TIMESTAMP
        WHERE transaction_id = $6
        `,
        [
          transaction.amount,
          transaction.date,
          transaction.name,
          transaction.category?.[0],
          transaction.pending,
          transaction.transaction_id,
        ]
      );
    }

    // Remove deleted transactions
    if (syncResponse.removed.length > 0) {
      const removedIds = syncResponse.removed.map(
        (t: any) => t.transaction_id
      );
      await client.query(
        `
        DELETE FROM transactions
        WHERE transaction_id = ANY($1)
        `,
        [removedIds]
      );
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function updateAccountVerificationStatus(
  accountId: string,
  status: string
) {
  await pool.query(
    `
    UPDATE plaid_accounts
    SET
      verification_status = $1,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    `,
    [status, accountId]
  );
} 