import api from './axiosConfig';

export const createLinkToken = async () => {
  const response = await api.post('/api/plaid/create-link-token');
  return response.data.link_token;
};

export const exchangePublicToken = async (publicToken: string) => {
  const response = await api.post('/api/plaid/exchange-public-token', {
    public_token: publicToken,
  });
  return response.data;
};

export const getTransactions = async (startDate: string, endDate: string) => {
  const response = await api.get('/api/plaid/transactions', {
    params: { start_date: startDate, end_date: endDate },
  });
  return response.data;
};

export const getAccounts = async () => {
  const response = await api.get('/api/plaid/accounts');
  return response.data;
};

export const getBalance = async () => {
  const response = await api.get('/api/plaid/balance');
  return response.data;
}; 