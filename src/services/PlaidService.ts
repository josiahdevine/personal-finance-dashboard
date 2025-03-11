import { api } from './api';
import { retry } from '../utils/retry';
import logger from '../utils/logger';

export interface LinkTokenResponse {
  link_token: string;
  expiration: string;
  request_id: string;
}

export interface PlaidAccount {
  id: string;
  plaid_account_id: string;
  name: string;
  official_name: string | null;
  type: string;
  subtype: string | null;
  balance: number;
  available_balance: number | null;
  limit_amount: number | null;
  currency_code: string;
  mask: string | null;
  institution_name: string;
  institution_color: string | null;
  institution_logo: string | null;
}

export interface PlaidTransaction {
  id: string;
  plaid_transaction_id: string;
  account_id: string;
  amount: number;
  date: string;
  name: string;
  merchant_name: string | null;
  payment_channel: string;
  pending: boolean;
  category: string | null;
  category_id: string | null;
  location: any | null;
}

class PlaidService {
  /**
   * Create a Plaid link token
   */
  async createLinkToken(products = ['transactions']): Promise<string> {
    try {
      const response = await retry(() => 
        api.get<LinkTokenResponse>('/api/plaid/create-link-token', { params: { products } })
      );
      
      return response.link_token;
    } catch (error) {
      logger.error('Plaid', 'Error creating Plaid link token:', error as Error);
      throw error;
    }
  }

  /**
   * Exchange public token for access token
   */
  async exchangePublicToken(publicToken: string, metadata: any): Promise<void> {
    try {
      await retry(() => 
        api.post('/api/plaid/exchange-public-token', {
          public_token: publicToken,
          metadata
        })
      );
    } catch (error) {
      logger.error('Plaid', 'Error exchanging public token:', error as Error);
      throw error;
    }
  }

  /**
   * Get accounts
   */
  async getAccounts(): Promise<PlaidAccount[]> {
    try {
      const response = await retry(() => 
        api.get<{ accounts: PlaidAccount[] }>('/api/plaid/accounts')
      );
      
      return response.accounts;
    } catch (error) {
      logger.error('Plaid', 'Error getting accounts:', error as Error);
      throw error;
    }
  }

  /**
   * Get transactions
   */
  async getTransactions(params: {
    start_date: string;
    end_date: string;
    account_ids?: string[];
    categories?: string[];
    offset?: number;
    limit?: number;
  }): Promise<{
    transactions: PlaidTransaction[];
    total: number;
    start_date: string;
    end_date: string;
  }> {
    try {
      // Convert arrays to comma-separated strings for query params
      const queryParams: Record<string, string> = {
        start_date: params.start_date,
        end_date: params.end_date
      };
      
      if (params.account_ids && params.account_ids.length > 0) {
        queryParams.account_ids = params.account_ids.join(',');
      }
      
      if (params.categories && params.categories.length > 0) {
        queryParams.categories = params.categories.join(',');
      }
      
      if (params.offset !== undefined) {
        queryParams.offset = params.offset.toString();
      }
      
      if (params.limit !== undefined) {
        queryParams.limit = params.limit.toString();
      }
      
      type TransactionResponse = {
        transactions: PlaidTransaction[];
        total: number;
        start_date: string;
        end_date: string;
      };
      
      const response = await retry(() => 
        api.get<TransactionResponse>('/api/plaid/transactions', { params: queryParams })
      );
      
      return response;
    } catch (error) {
      logger.error('Plaid', 'Error getting transactions:', error as Error);
      throw error;
    }
  }

  /**
   * Sync transactions
   */
  async syncTransactions(): Promise<{ 
    results: Array<{
      institution_id: string;
      institution_name: string;
      status: string;
      transaction_count?: number;
      error?: string;
    }>
  }> {
    try {
      type SyncResponse = {
        results: Array<{
          institution_id: string;
          institution_name: string;
          status: string;
          transaction_count?: number;
          error?: string;
        }>
      };
      
      const response = await retry(() => 
        api.post<SyncResponse>('/api/plaid/sync-transactions')
      );
      
      return response;
    } catch (error) {
      logger.error('Plaid', 'Error syncing transactions:', error as Error);
      throw error;
    }
  }

  /**
   * Get balance history
   */
  async getBalanceHistory(params: {
    start_date: string;
    end_date: string;
    account_ids?: string[];
  }): Promise<{
    balance_history: Array<{
      date: string;
      total_balance: number;
    }>;
    start_date: string;
    end_date: string;
  }> {
    try {
      // Convert arrays to comma-separated strings for query params
      const queryParams: Record<string, string> = {
        start_date: params.start_date,
        end_date: params.end_date
      };
      
      if (params.account_ids && params.account_ids.length > 0) {
        queryParams.account_ids = params.account_ids.join(',');
      }
      
      type BalanceHistoryResponse = {
        balance_history: Array<{
          date: string;
          total_balance: number;
        }>;
        start_date: string;
        end_date: string;
      };
      
      const response = await retry(() => 
        api.get<BalanceHistoryResponse>('/api/plaid/balance-history', { params: queryParams })
      );
      
      return response;
    } catch (error) {
      logger.error('Plaid', 'Error getting balance history:', error as Error);
      throw error;
    }
  }

  /**
   * Get investment holdings
   */
  async getInvestmentHoldings(): Promise<any> {
    try {
      const response = await retry(() => 
        api.get('/api/plaid/investments/holdings')
      );
      
      return response;
    } catch (error) {
      logger.error('Plaid', 'Error getting investment holdings:', error as Error);
      throw error;
    }
  }

  /**
   * Get investment transactions
   */
  async getInvestmentTransactions(
    startDate: string,
    endDate: string
  ): Promise<any> {
    try {
      const response = await retry(() =>
        api.get('/api/plaid/investments/transactions', {
          params: { start_date: startDate, end_date: endDate }
        })
      );
      
      return response;
    } catch (error) {
      logger.error('Plaid', 'Error getting investment transactions:', error as Error);
      throw error;
    }
  }
}

export const plaidService = new PlaidService();
export default plaidService;
