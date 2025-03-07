import api from './api';

export interface PlaidAccount {
  id: string;
  plaidAccountId: string;
  name: string;
  mask: string | null;
  type: string;
  subtype: string | null;
  isoCurrencyCode: string;
  balance: {
    available: number;
    current: number;
    limit: number | null;
  };
  institutionName: string;
  institutionId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlaidTransaction {
  id: string;
  plaidTransactionId: string;
  accountId: string;
  amount: number;
  date: string;
  description: string;
  merchantName: string | null;
  category: string[];
  pending: boolean;
  type: string;
  isoCurrencyCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlaidLinkToken {
  linkToken: string;
}

export interface PlaidExchangeResponse {
  accessToken: string;
  itemId: string;
}

export interface PlaidAccountsResponse {
  accounts: PlaidAccount[];
}

export interface PlaidTransactionsResponse {
  transactions: PlaidTransaction[];
}

class PlaidService {
  static async getAccounts(userId: string): Promise<PlaidAccount[]> {
    try {
      const { data } = await api.get<PlaidAccountsResponse>(`/plaid/accounts/${userId}`);
      return data.accounts;
    } catch (error) {
      console.error('Error fetching Plaid accounts:', error);
      throw error;
    }
  }

  static async getTransactions(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<PlaidTransaction[]> {
    try {
      const { data } = await api.get<PlaidTransactionsResponse>(
        `/plaid/transactions/${userId}`,
        {
          params: { startDate, endDate }
        }
      );
      return data.transactions;
    } catch (error) {
      console.error('Error fetching Plaid transactions:', error);
      throw error;
    }
  }

  static async createLinkToken(userId: string): Promise<PlaidLinkToken> {
    try {
      const { data } = await api.post<PlaidLinkToken>('/plaid/create-link-token', { userId });
      return data;
    } catch (error) {
      console.error('Error creating Plaid link token:', error);
      throw error;
    }
  }

  static async exchangePublicToken(
    publicToken: string,
    userId: string
  ): Promise<PlaidExchangeResponse> {
    try {
      const { data } = await api.post<PlaidExchangeResponse>(
        '/plaid/exchange-public-token',
        { publicToken, userId }
      );
      return data;
    } catch (error) {
      console.error('Error exchanging Plaid public token:', error);
      throw error;
    }
  }
}

// Also export individual functions for backward compatibility
export const getAccounts = PlaidService.getAccounts;
export const getTransactions = PlaidService.getTransactions;
export const createLinkToken = PlaidService.createLinkToken;
export const exchangePublicToken = PlaidService.exchangePublicToken;

export default PlaidService;
