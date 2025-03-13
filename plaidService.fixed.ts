import { api } from '../services/api';
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
  category: string[];
  date: string;
  name: string;
  amount: number;
  pending: boolean;
  currency_code: string;
  payment_channel: string;
  merchant_name: string | null;
}

class PlaidService {
  private baseUrl = '/api/plaid';

  async createLinkToken(): Promise<string> {
    try {
      const response = await retry<LinkTokenResponse>(
        () => api.post(`${this.baseUrl}/create-link-token`),
        {
          retries: 3,
          backoff: 300,
        }
      );
      
      return response.data.link_token;
    } catch (error) {
      logger.error('Plaid', 'Error creating link token:', error as Error);
      throw error;
    }
  }

  async exchangePublicToken(publicToken: string): Promise<{ success: boolean }> {
    try {
      await retry(
        () => api.post(`${this.baseUrl}/exchange-public-token`, { publicToken }),
        {
          retries: 3,
          backoff: 300,
        }
      );
      
      return { success: true };
    } catch (error) {
      logger.error('Plaid', 'Error exchanging public token:', error as Error);
      throw error;
    }
  }

  async getAccounts(): Promise<PlaidAccount[]> {
    try {
      const response = await retry<{ accounts: PlaidAccount[] }>(
        () => api.get(`${this.baseUrl}/accounts`),
        {
          retries: 3,
          backoff: 300,
        }
      );
      
      return response.data.accounts;
    } catch (error) {
      logger.error('Plaid', 'Error getting accounts:', error as Error);
      throw error;
    }
  }

  async getTransactions(options: {
    startDate?: string;
    endDate?: string;
    accountIds?: string[];
    count?: number;
    offset?: number;
  } = {}): Promise<PlaidTransaction[]> {
    try {
      const response = await retry<{ transactions: PlaidTransaction[] }>(
        () => api.get(`${this.baseUrl}/transactions`, { params: options }),
        {
          retries: 3,
          backoff: 300,
        }
      );
      
      return response.data.transactions;
    } catch (error) {
      logger.error('Plaid', 'Error getting transactions:', error as Error);
      throw error;
    }
  }

  async syncTransactions(): Promise<{ added: number; modified: number; removed: number }> {
    try {
      const response = await retry<{ added: number; modified: number; removed: number }>(
        () => api.post(`${this.baseUrl}/sync`),
        {
          retries: 3,
          backoff: 300,
        }
      );
      
      return response.data;
    } catch (error) {
      logger.error('Plaid', 'Error syncing transactions:', error as Error);
      throw error;
    }
  }

  async getBalanceHistory(accountId: string, period: 'week' | 'month' | 'year' = 'month'): Promise<Array<{ date: string; balance: number }>> {
    try {
      const response = await retry<{ history: Array<{ date: string; balance: number }> }>(
        () => api.get(`${this.baseUrl}/balance-history/${accountId}`, { params: { period } }),
        {
          retries: 3,
          backoff: 300,
        }
      );
      
      return response.data.history;
    } catch (error) {
      logger.error('Plaid', 'Error getting balance history:', error as Error);
      throw error;
    }
  }

  async getInvestmentHoldings(): Promise<any[]> {
    try {
      const response = await retry<{ holdings: any[] }>(
        () => api.get(`${this.baseUrl}/investments/holdings`),
        {
          retries: 3,
          backoff: 300,
        }
      );
      
      return response.data.holdings;
    } catch (error) {
      logger.error('Plaid', 'Error getting investment holdings:', error as Error);
      throw error;
    }
  }

  async getInvestmentTransactions(options: {
    startDate?: string;
    endDate?: string;
  } = {}): Promise<any[]> {
    try {
      const response = await retry<{ transactions: any[] }>(
        () => api.get(`${this.baseUrl}/investments/transactions`, { params: options }),
        {
          retries: 3,
          backoff: 300,
        }
      );
      
      return response.data.transactions;
    } catch (error) {
      logger.error('Plaid', 'Error getting investment transactions:', error as Error);
      throw error;
    }
  }
}

// Create a singleton instance
const plaidServiceInstance = new PlaidService();

// Export as both default and named export for compatibility
export { plaidServiceInstance as plaidService };
export default plaidServiceInstance; 