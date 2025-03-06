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

export const getAccounts = async (userId: string): Promise<PlaidAccount[]> => {
  try {
    const { data } = await api.get<PlaidAccountsResponse>(`/plaid/accounts/${userId}`);
    return data.accounts;
  } catch (error) {
    console.error('Error fetching Plaid accounts:', error);
    throw error;
  }
};

export const getTransactions = async (
  userId: string,
  startDate: string,
  endDate: string
): Promise<PlaidTransaction[]> => {
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
};

export const createLinkToken = async (userId: string): Promise<PlaidLinkToken> => {
  try {
    const { data } = await api.post<PlaidLinkToken>('/plaid/create-link-token', { userId });
    return data;
  } catch (error) {
    console.error('Error creating Plaid link token:', error);
    throw error;
  }
};

export const exchangePublicToken = async (
  publicToken: string,
  userId: string
): Promise<PlaidExchangeResponse> => {
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
};
