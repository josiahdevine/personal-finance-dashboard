import { Router } from 'express';
import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';
import { requireAuth } from '../middleware/requireAuth';
import { pool } from '../db';
import { TokenStorage } from '../utils/tokenStorage';

const router = Router();

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

// Create a link token
router.post('/create-link-token', requireAuth, async (req, res) => {
  try {
    const { user } = req;
    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: user!.id },
      client_name: 'Personal Finance Dashboard',
      products: ['transactions', 'auth'] as Products[],
      country_codes: ['US'] as CountryCode[],
      language: 'en',
      webhook: process.env.PLAID_WEBHOOK_URL,
    });

    res.json({ link_token: response.data.link_token });
  } catch (error) {
    console.error('Error creating link token:', error);
    res.status(500).json({ message: 'Failed to create link token' });
  }
});

// Exchange public token for access token
router.post('/exchange-token', requireAuth, async (req, res) => {
  try {
    const { publicToken } = req.body;
    const { user } = req;

    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const accessToken = exchangeResponse.data.access_token;
    const itemId = exchangeResponse.data.item_id;

    // Encrypt the access token
    const { encryptedData, iv, authTag } = TokenStorage.encrypt(accessToken);

    // Get accounts associated with this item
    const accountsResponse = await plaidClient.accountsGet({
      access_token: accessToken,
    });

    // Begin transaction
    await pool.query('BEGIN');

    try {
      // Store the encrypted access token and accounts
      for (const account of accountsResponse.data.accounts) {
        await pool.query(
          `
          INSERT INTO plaid_accounts (
            user_id,
            item_id,
            access_token,
            access_token_iv,
            access_token_tag,
            account_id,
            account_name,
            account_type,
            account_subtype,
            mask
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (user_id, account_id) DO UPDATE
          SET
            access_token = EXCLUDED.access_token,
            access_token_iv = EXCLUDED.access_token_iv,
            access_token_tag = EXCLUDED.access_token_tag,
            account_name = EXCLUDED.account_name,
            account_type = EXCLUDED.account_type,
            account_subtype = EXCLUDED.account_subtype,
            mask = EXCLUDED.mask,
            updated_at = CURRENT_TIMESTAMP
          `,
          [
            user!.id,
            itemId,
            encryptedData,
            iv,
            authTag,
            account.account_id,
            account.name,
            account.type,
            account.subtype,
            account.mask,
          ]
        );
      }

      await pool.query('COMMIT');
      res.json({ message: 'Successfully linked account' });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error exchanging token:', error);
    res.status(500).json({ message: 'Failed to exchange token' });
  }
});

// Get accounts for a user
router.get('/accounts/:userId', requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Ensure users can only access their own accounts
    if (userId !== req.user!.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const result = await pool.query(
      `SELECT * FROM plaid_accounts WHERE user_id = $1`,
      [userId]
    );

    const accounts = await Promise.all(
      result.rows.map(async (account) => {
        const { access_token, access_token_iv, access_token_tag } = account;
        const accessToken = TokenStorage.decrypt(
          access_token,
          access_token_iv,
          access_token_tag
        );

        const plaidResponse = await plaidClient.accountsGet({
          access_token: accessToken,
        });

        const plaidAccount = plaidResponse.data.accounts.find(
          (a) => a.account_id === account.account_id
        );

        return plaidAccount;
      })
    );

    res.json({ accounts });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ message: 'Failed to fetch accounts' });
  }
});

// Refresh account balances
router.post('/refresh/:userId', requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    // Ensure users can only access their own accounts
    if (userId !== req.user!.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const result = await pool.query(
      `SELECT * FROM plaid_accounts WHERE user_id = $1`,
      [userId]
    );

    await Promise.all(
      result.rows.map(async (account) => {
        const { access_token, access_token_iv, access_token_tag } = account;
        const accessToken = TokenStorage.decrypt(
          access_token,
          access_token_iv,
          access_token_tag
        );

        await plaidClient.accountsBalanceGet({
          access_token: accessToken,
        });
      })
    );

    res.json({ message: 'Successfully refreshed balances' });
  } catch (error) {
    console.error('Error refreshing balances:', error);
    res.status(500).json({ message: 'Failed to refresh balances' });
  }
});

// Sync transactions
router.post('/sync/:userId', requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    // Ensure users can only access their own accounts
    if (userId !== req.user!.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const result = await pool.query(
      `SELECT * FROM plaid_accounts WHERE user_id = $1`,
      [userId]
    );

    await Promise.all(
      result.rows.map(async (account) => {
        const { access_token, access_token_iv, access_token_tag } = account;
        const accessToken = TokenStorage.decrypt(
          access_token,
          access_token_iv,
          access_token_tag
        );

        await plaidClient.transactionsSync({
          access_token: accessToken,
        });
      })
    );

    res.json({ message: 'Successfully synced transactions' });
  } catch (error) {
    console.error('Error syncing transactions:', error);
    res.status(500).json({ message: 'Failed to sync transactions' });
  }
});

// Handle webhook
router.post('/webhook', async (req, res) => {
  try {
    const { webhook_type, webhook_code, item_id } = req.body;

    const result = await pool.query(
      `SELECT * FROM plaid_accounts WHERE item_id = $1`,
      [item_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Account not found' });
    }

    const account = result.rows[0];
    const { access_token, access_token_iv, access_token_tag } = account;
    const accessToken = TokenStorage.decrypt(
      access_token,
      access_token_iv,
      access_token_tag
    );

    switch (webhook_type) {
      case 'TRANSACTIONS':
        switch (webhook_code) {
          case 'INITIAL_UPDATE':
          case 'HISTORICAL_UPDATE':
          case 'DEFAULT_UPDATE':
            await plaidClient.transactionsSync({
              access_token: accessToken,
            });
            break;
        }
        break;

      case 'ITEM':
        switch (webhook_code) {
          case 'ERROR':
            console.error('Plaid item error:', req.body);
            break;
        }
        break;
    }

    res.json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ message: 'Failed to process webhook' });
  }
});

export default router; 