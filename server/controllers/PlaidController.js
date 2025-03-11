const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
const { encrypt, decrypt } = require('../utils/encryption');
const logger = require('../utils/logger');
const db = require('../config/database');
const pool = require('../db');

// Plaid configuration
const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);
const PLAID_PRODUCTS = process.env.PLAID_PRODUCTS?.split(',') || ['transactions', 'auth', 'identity', 'investments'];
const PLAID_COUNTRY_CODES = process.env.PLAID_COUNTRY_CODES?.split(',') || ['US'];
const PLAID_REDIRECT_URI = process.env.PLAID_REDIRECT_URI;

class PlaidController {
  /**
   * Create a link token for initializing Plaid Link
   */
  static async createLinkToken(req, res) {
    try {
      const user_id = req.user?.id || req.user?.userId || req.user?.user_id;
      
      logger.info('Creating link token for user:', user_id);
      
      const request = {
        user: { client_user_id: user_id.toString() },
        client_name: 'Financial Dashboard',
        products: PLAID_PRODUCTS,
        language: 'en',
        country_codes: PLAID_COUNTRY_CODES,
      };
      
      // Add redirect URI if available
      if (PLAID_REDIRECT_URI) {
        request.redirect_uri = PLAID_REDIRECT_URI;
      }
      
      logger.debug('Link token request:', request);
      
      const response = await plaidClient.linkTokenCreate(request);
      logger.info('Link token created successfully');
      res.json({ link_token: response.data.link_token });
    } catch (err) {
      logger.error('Error creating link token', err);
      
      // More detailed error handling for network issues
      if (err.code === 'EAI_AGAIN' || err.code === 'ECONNREFUSED') {
        return res.status(503).json({ 
          error: 'Network connectivity issue with Plaid. Please try again in a few moments.',
          details: err.message 
        });
      }
      
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * Exchange public token for access token and store item
   */
  static async exchangePublicToken(req, res) {
    try {
      const { public_token, metadata } = req.body;
      const user_id = req.user?.id || req.user?.userId || req.user?.user_id;
      
      logger.info('Exchanging public token for user:', user_id);
      
      const exchangeResponse = await plaidClient.itemPublicTokenExchange({
        public_token,
      });
      
      const accessToken = exchangeResponse.data.access_token;
      const itemId = exchangeResponse.data.item_id;
      
      // Get institution details
      const institutionId = metadata.institution.institution_id;
      const institutionResponse = await plaidClient.institutionsGetById({
        institution_id: institutionId,
        country_codes: PLAID_COUNTRY_CODES,
      });
      
      const institution = institutionResponse.data.institution;
      
      // Encrypt access token
      const encryptedToken = encrypt(accessToken);
      
      // Store in database
      await db.query(
        `INSERT INTO plaid_items (
          user_id, plaid_item_id, plaid_access_token, plaid_institution_id, 
          institution_name, institution_color, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (user_id, plaid_item_id) 
        DO UPDATE SET
          plaid_access_token = $3,
          institution_name = $5,
          institution_color = $6,
          is_active = $7`,
        [
          user_id, 
          itemId, 
          encryptedToken, 
          institutionId, 
          institution.name, 
          institution.primary_color,
          true
        ]
      );
      
      // Get accounts from the item
      await this.fetchAndStoreAccounts(accessToken, itemId, user_id);
      
      res.json({ success: true });
    } catch (err) {
      logger.error('Error exchanging public token', err);
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * Fetch and store accounts for a Plaid item
   */
  static async fetchAndStoreAccounts(accessToken, itemId, userId) {
    try {
      const accountsResponse = await plaidClient.accountsGet({
        access_token: accessToken,
      });
      
      const accounts = accountsResponse.data.accounts;
      
      // Begin transaction
      const client = await db.pool.connect();
      
      try {
        await client.query('BEGIN');
        
        for (const account of accounts) {
          // Check if account exists
          const existingAccount = await client.query(
            `SELECT id FROM plaid_accounts WHERE user_id = $1 AND plaid_account_id = $2`,
            [userId, account.account_id]
          );
          
          if (existingAccount.rows.length > 0) {
            // Update existing account
            await client.query(
              `UPDATE plaid_accounts SET
                name = $1,
                type = $2,
                subtype = $3,
                balance = $4,
                available_balance = $5,
                currency_code = $6,
                updated_at = NOW()
              WHERE user_id = $7 AND plaid_account_id = $8`,
              [
                account.name,
                account.type,
                account.subtype,
                account.balances.current,
                account.balances.available,
                account.balances.iso_currency_code,
                userId,
                account.account_id
              ]
            );
          } else {
            // Insert new account
            await client.query(
              `INSERT INTO plaid_accounts (
                user_id, plaid_item_id, plaid_account_id, name, official_name, 
                type, subtype, balance, available_balance, limit_amount, 
                currency_code, mask
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
              [
                userId,
                itemId,
                account.account_id,
                account.name,
                account.official_name,
                account.type,
                account.subtype,
                account.balances.current,
                account.balances.available,
                account.balances.limit,
                account.balances.iso_currency_code,
                account.mask
              ]
            );
          }
        }
        
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
      
      return accounts;
    } catch (err) {
      logger.error('Error fetching and storing accounts', err);
      throw err;
    }
  }

  /**
   * Get all accounts for a user
   */
  static async getAccounts(req, res) {
    try {
      const user_id = req.user?.id || req.user?.userId || req.user?.user_id;
      
      const accountsResult = await db.query(
        `SELECT a.*, i.institution_name, i.institution_color
         FROM plaid_accounts a
         JOIN plaid_items i ON a.plaid_item_id = i.plaid_item_id
         WHERE a.user_id = $1 AND a.is_deleted = false
         ORDER BY i.institution_name, a.name`,
        [user_id]
      );
      
      const accounts = accountsResult.rows;
      
      res.json({ accounts });
    } catch (err) {
      logger.error('Error getting accounts', err);
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * Get transactions for a user
   */
  static async getTransactions(req, res) {
    try {
      const user_id = req.user?.id || req.user?.userId || req.user?.user_id;
      const { start_date, end_date, account_ids, categories, offset, limit } = req.query;
      
      // Validate required parameters
      if (!start_date || !end_date) {
        return res.status(400).json({ error: 'start_date and end_date are required' });
      }
      
      // Build the base query
      let queryText = `
        SELECT t.*, a.name as account_name, a.type as account_type, 
               i.institution_name, i.institution_color
        FROM transactions t
        JOIN plaid_accounts a ON t.account_id = a.id
        JOIN plaid_items i ON a.plaid_item_id = i.plaid_item_id
        WHERE t.user_id = $1 AND t.date BETWEEN $2 AND $3
      `;
      
      const queryParams = [user_id, start_date, end_date];
      let paramIndex = 4;
      
      // Add optional filters
      if (account_ids) {
        const accountIdArray = account_ids.split(',');
        queryText += ` AND a.id IN (${accountIdArray.map((_, i) => `$${paramIndex + i}`).join(',')})`;
        queryParams.push(...accountIdArray);
        paramIndex += accountIdArray.length;
      }
      
      if (categories) {
        const categoryArray = categories.split(',');
        queryText += ` AND t.category IN (${categoryArray.map((_, i) => `$${paramIndex + i}`).join(',')})`;
        queryParams.push(...categoryArray);
        paramIndex += categoryArray.length;
      }
      
      // Add ordering
      queryText += ` ORDER BY t.date DESC, t.id DESC`;
      
      // Add pagination
      if (limit) {
        queryText += ` LIMIT $${paramIndex}`;
        queryParams.push(parseInt(limit));
        paramIndex++;
        
        if (offset) {
          queryText += ` OFFSET $${paramIndex}`;
          queryParams.push(parseInt(offset));
        }
      }
      
      // Execute query
      const transactionsResult = await db.query(queryText, queryParams);
      
      // Get total count for pagination
      const countQuery = `
        SELECT COUNT(*) as total
        FROM transactions t
        JOIN plaid_accounts a ON t.account_id = a.id
        WHERE t.user_id = $1 AND t.date BETWEEN $2 AND $3
      `;
      
      const countParams = [user_id, start_date, end_date];
      paramIndex = 4;
      
      // Add same filters for count
      if (account_ids) {
        const accountIdArray = account_ids.split(',');
        countQuery += ` AND a.id IN (${accountIdArray.map((_, i) => `$${paramIndex + i}`).join(',')})`;
        countParams.push(...accountIdArray);
      }
      
      if (categories) {
        const categoryArray = categories.split(',');
        countQuery += ` AND t.category IN (${categoryArray.map((_, i) => `$${paramIndex + i}`).join(',')})`;
        countParams.push(...categoryArray);
      }
      
      const countResult = await db.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].total);
      
      res.json({
        transactions: transactionsResult.rows,
        total,
        start_date,
        end_date
      });
    } catch (err) {
      logger.error('Error getting transactions', err);
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * Sync transactions for all items
   */
  static async syncTransactions(req, res) {
    try {
      const user_id = req.user?.id || req.user?.userId || req.user?.user_id;
      
      // Get all active Plaid items for the user
      const itemsResult = await db.query(
        `SELECT * FROM plaid_items WHERE user_id = $1 AND is_active = true`,
        [user_id]
      );
      
      const items = itemsResult.rows;
      
      if (items.length === 0) {
        return res.json({ message: 'No items to sync' });
      }
      
      const syncResults = [];
      
      for (const item of items) {
        try {
          // Decrypt access token
          const accessToken = decrypt(item.plaid_access_token);
          
          // Set date range (30 days back)
          const endDate = new Date();
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - 30);
          
          const formattedStartDate = startDate.toISOString().split('T')[0];
          const formattedEndDate = endDate.toISOString().split('T')[0];
          
          // Get transactions from Plaid
          const transactionsResponse = await plaidClient.transactionsGet({
            access_token: accessToken,
            start_date: formattedStartDate,
            end_date: formattedEndDate,
            options: {
              include_personal_finance_category: true
            }
          });
          
          // Process and store transactions
          await this.processAndStoreTransactions(
            transactionsResponse.data,
            user_id,
            item.plaid_item_id
          );
          
          syncResults.push({
            institution_id: item.plaid_institution_id,
            institution_name: item.institution_name,
            status: 'success',
            transaction_count: transactionsResponse.data.transactions.length
          });
        } catch (err) {
          logger.error(`Error syncing item ${item.plaid_item_id}:`, err);
          syncResults.push({
            institution_id: item.plaid_institution_id,
            institution_name: item.institution_name,
            status: 'error',
            error: err.message
          });
        }
      }
      
      res.json({ results: syncResults });
    } catch (err) {
      logger.error('Error syncing transactions', err);
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * Process and store transactions
   */
  static async processAndStoreTransactions(data, userId, itemId) {
    const { accounts, transactions } = data;
    
    // Begin transaction
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Map of Plaid account IDs to our database account IDs
      const accountMap = {};
      
      // Update accounts
      for (const account of accounts) {
        const accountResult = await client.query(
          `SELECT id FROM plaid_accounts 
           WHERE user_id = $1 AND plaid_account_id = $2`,
          [userId, account.account_id]
        );
        
        if (accountResult.rows.length > 0) {
          const accountId = accountResult.rows[0].id;
          accountMap[account.account_id] = accountId;
          
          // Update account
          await client.query(
            `UPDATE plaid_accounts SET
              balance = $1,
              available_balance = $2,
              updated_at = NOW()
            WHERE id = $3`,
            [
              account.balances.current,
              account.balances.available,
              accountId
            ]
          );
        }
      }
      
      // Process transactions
      for (const transaction of transactions) {
        const accountId = accountMap[transaction.account_id];
        
        if (!accountId) {
          logger.warn(`Account ID not found for Plaid account: ${transaction.account_id}`);
          continue;
        }
        
        // Check if transaction exists
        const existingTransaction = await client.query(
          `SELECT id FROM transactions 
           WHERE plaid_transaction_id = $1 AND user_id = $2`,
          [transaction.transaction_id, userId]
        );
        
        if (existingTransaction.rows.length > 0) {
          // Update existing transaction
          await client.query(
            `UPDATE transactions SET
              account_id = $1,
              amount = $2,
              date = $3,
              name = $4,
              merchant_name = $5,
              payment_channel = $6,
              pending = $7,
              category = $8,
              category_id = $9,
              location = $10,
              updated_at = NOW()
            WHERE id = $11`,
            [
              accountId,
              transaction.amount,
              transaction.date,
              transaction.name,
              transaction.merchant_name,
              transaction.payment_channel,
              transaction.pending,
              transaction.personal_finance_category?.primary || transaction.category[0],
              transaction.category_id,
              JSON.stringify(transaction.location),
              existingTransaction.rows[0].id
            ]
          );
        } else {
          // Insert new transaction
          await client.query(
            `INSERT INTO transactions (
              user_id, account_id, plaid_transaction_id, plaid_item_id, 
              amount, date, name, merchant_name, payment_channel, 
              pending, category, category_id, location
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
            [
              userId,
              accountId,
              transaction.transaction_id,
              itemId,
              transaction.amount,
              transaction.date,
              transaction.name,
              transaction.merchant_name,
              transaction.payment_channel,
              transaction.pending,
              transaction.personal_finance_category?.primary || transaction.category[0],
              transaction.category_id,
              JSON.stringify(transaction.location)
            ]
          );
        }
      }
      
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Get balance history
   */
  static async getBalanceHistory(req, res) {
    try {
      const user_id = req.user?.id || req.user?.userId || req.user?.user_id;
      const { start_date, end_date, account_ids } = req.query;
      const days = parseInt(req.query.days) || 30; // Default to 30 days
      
      // Validate required parameters or use date range
      let queryText;
      let queryParams;
      
      if (start_date && end_date) {
        // Use specific date range if provided
        queryText = `
          SELECT date, SUM(balance) as total_balance
          FROM account_balances
          WHERE user_id = $1 AND date BETWEEN $2 AND $3
        `;
        
        queryParams = [user_id, start_date, end_date];
        
        // Add optional account filter
        if (account_ids) {
          const accountIdArray = account_ids.split(',');
          queryText += ` AND account_id IN (${accountIdArray.map((_, i) => `$${4 + i}`).join(',')})`;
          queryParams.push(...accountIdArray);
        }
      } else {
        // Use days parameter for dynamic date range
        queryText = `
          SELECT 
            date_trunc('day', recorded_at) as date,
            SUM(current_balance) as total_balance
          FROM account_balances ab
          JOIN plaid_accounts pa ON ab.account_id = pa.id
          WHERE pa.user_id = $1
          AND recorded_at >= NOW() - INTERVAL '${days} days'
        `;
        
        queryParams = [user_id];
        
        // Add optional account filter
        if (account_ids) {
          const accountIdArray = account_ids.split(',');
          queryText += ` AND ab.account_id IN (${accountIdArray.map((_, i) => `$${2 + i}`).join(',')})`;
          queryParams.push(...accountIdArray);
        }
      }
      
      // Group by date and order
      queryText += ` GROUP BY date ORDER BY date`;
      
      // Execute query
      const result = await (db.query ? db.query(queryText, queryParams) : pool.query(queryText, queryParams));
      
      // Format data for Chart.js if needed
      if (req.query.format === 'chart') {
        const labels = result.rows.map(row => new Date(row.date).toLocaleDateString());
        const data = result.rows.map(row => parseFloat(row.total_balance));
        
        const chartData = {
          labels,
          datasets: [{
            label: 'Net Worth',
            data,
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          }]
        };
        
        return res.json(chartData);
      }
      
      // Return raw data otherwise
      res.json({
        balance_history: result.rows,
        start_date: start_date || new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end_date: end_date || new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      logger.error('Error getting balance history', err);
      res.status(500).json({ error: err.message });
    }
  }
  
  /**
   * Get Plaid connection status
   */
  static async getStatus(req, res) {
    try {
      const user_id = req.user?.id || req.user?.userId || req.user?.user_id;
      
      // Get all Plaid items for the user
      const itemsResult = await db.query(
        `SELECT COUNT(*) as count FROM plaid_items WHERE user_id = $1 AND is_active = true`,
        [user_id]
      );
      
      const itemCount = parseInt(itemsResult.rows[0].count);
      
      // Get account count
      const accountsResult = await db.query(
        `SELECT COUNT(*) as count FROM plaid_accounts WHERE user_id = $1 AND is_deleted = false`,
        [user_id]
      );
      
      const accountCount = parseInt(accountsResult.rows[0].count);
      
      // Get transaction count
      const transactionsResult = await db.query(
        `SELECT COUNT(*) as count FROM transactions WHERE user_id = $1`,
        [user_id]
      );
      
      const transactionCount = parseInt(transactionsResult.rows[0].count);
      
      res.json({
        status: 'success',
        data: {
          connected: itemCount > 0,
          items: itemCount,
          accounts: accountCount,
          transactions: transactionCount,
          last_sync: new Date().toISOString() // Get actual last sync time from DB if available
        }
      });
    } catch (err) {
      logger.error('Error getting Plaid status', err);
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = PlaidController; 