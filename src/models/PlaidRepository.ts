import { BaseRepository } from './BaseRepository';
import { PlaidAccount, Transaction } from './types';
import { query, transaction } from '../db';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

export class PlaidRepository extends BaseRepository<PlaidAccount> {
  private plaidClient: PlaidApi;

  constructor() {
    super('plaid_accounts');
    
    const configuration = new Configuration({
      basePath: PlaidEnvironments[process.env.REACT_APP_PLAID_ENV || 'sandbox'],
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': process.env.REACT_APP_PLAID_CLIENT_ID!,
          'PLAID-SECRET': process.env.REACT_APP_PLAID_SECRET!,
        },
      },
    });

    this.plaidClient = new PlaidApi(configuration);
  }

  async findByUserId(userId: string): Promise<PlaidAccount[]> {
    const cacheKey = this.getCacheKey(`user_${userId}`);
    const cached = this.getCache(cacheKey);
    if (cached) return [cached];

    const results = await query(
      'SELECT * FROM plaid_accounts WHERE user_id = $1',
      [userId]
    ).then(rows => rows as PlaidAccount[]);

    return results;
  }

  async syncTransactions(account: PlaidAccount): Promise<Transaction[]> {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

      const response = await this.plaidClient.transactionsGet({
        access_token: account.access_token,
        start_date: thirtyDaysAgo.toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
      });

      const transactions = response.data.transactions;

      return await transaction(async (client) => {
        const results: Transaction[] = [];

        for (const txn of transactions) {
          const result = await client(
            `
              INSERT INTO transactions (
                user_id,
                plaid_account_id,
                plaid_transaction_id,
                amount,
                category,
                subcategory,
                description,
                date,
                merchant_name,
                pending
              )
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
              ON CONFLICT (plaid_transaction_id) DO UPDATE
              SET
                amount = EXCLUDED.amount,
                category = EXCLUDED.category,
                subcategory = EXCLUDED.subcategory,
                description = EXCLUDED.description,
                merchant_name = EXCLUDED.merchant_name,
                pending = EXCLUDED.pending,
                updated_at = CURRENT_TIMESTAMP
              RETURNING *
            `,
            [
              account.user_id,
              account.id,
              txn.transaction_id,
              txn.amount,
              txn.category?.[0] || null,
              txn.category?.[1] || null,
              txn.name,
              txn.date,
              txn.merchant_name,
              txn.pending,
            ]
          ).then(rows => rows[0] as Transaction);

          if (result) {
            results.push(result);
          }
        }

        return results;
      });
    } catch (error) {
      console.error('Error syncing transactions:', error);
      throw error;
    }
  }

  async syncAllUserTransactions(userId: string): Promise<Transaction[]> {
    const accounts = await this.findByUserId(userId);
    const allTransactions: Transaction[] = [];

    for (const account of accounts) {
      const transactions = await this.syncTransactions(account);
      allTransactions.push(...transactions);
    }

    return allTransactions;
  }

  async refreshAccountBalances(account: PlaidAccount): Promise<void> {
    try {
      const response = await this.plaidClient.accountsBalanceGet({
        access_token: account.access_token,
      });

      const balances = response.data.accounts;

      await transaction(async (client) => {
        for (const balance of balances) {
          await client(
            `
              UPDATE plaid_accounts
              SET
                current_balance = $1,
                available_balance = $2,
                updated_at = CURRENT_TIMESTAMP
              WHERE account_id = $3
            `,
            [
              balance.balances.current,
              balance.balances.available,
              balance.account_id,
            ]
          );
        }
      });
    } catch (error) {
      console.error('Error refreshing account balances:', error);
      throw error;
    }
  }

  async refreshAllUserBalances(userId: string): Promise<void> {
    const accounts = await this.findByUserId(userId);
    
    for (const account of accounts) {
      await this.refreshAccountBalances(account);
    }
  }
} 