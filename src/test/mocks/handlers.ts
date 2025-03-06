import { http, HttpResponse } from 'msw';

interface PlaidTokenRequest {
  public_token: string;
}

interface AiRequest {
  prompt: string;
}

export const handlers = [
  // Plaid endpoints
  http.post('/api/plaid/create-link-token', () => {
    return HttpResponse.json({
      link_token: 'mock-link-token',
      expiration: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
  }),

  http.post('/api/plaid/exchange-public-token', async ({ request }) => {
    const { public_token: _public_token } = await request.json() as PlaidTokenRequest;

    return HttpResponse.json({
      access_token: 'mock-access-token',
      item_id: 'mock-item-id',
    });
  }),

  http.get('/api/plaid/transactions', () => {
    return HttpResponse.json({
      transactions: [
        {
          id: '1',
          amount: 50.00,
          date: '2024-03-01',
          name: 'Coffee Shop',
          category: 'Food & Drink',
        },
        {
          id: '2',
          amount: 1000.00,
          date: '2024-03-01',
          name: 'Salary Deposit',
          category: 'Income',
        },
      ],
    });
  }),

  // AI endpoints
  http.post('/api/ai/chat', async ({ request }) => {
    const { prompt } = await request.json() as AiRequest;
    return HttpResponse.json({
      response: `Mock AI response to: ${prompt}`,
    });
  }),

  // User data endpoints
  http.get('/api/user/profile', () => {
    return HttpResponse.json({
      id: '1',
      email: 'demo@personalfinance.com',
      name: 'Demo User',
      settings: {
        theme: 'light',
        currency: 'USD',
        notifications: true,
      },
    });
  }),

  http.get('/api/user/financial-summary', () => {
    return HttpResponse.json({
      totalBalance: 25000.00,
      monthlyIncome: 5000.00,
      monthlyExpenses: 3000.00,
      investments: 15000.00,
      savings: 7000.00,
      debt: 2000.00,
    });
  }),
]; 