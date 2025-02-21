import axios from 'axios';

// Get the API URL from environment variables
const baseURL = 'https://personal-finance-dashboard-gxslmpvop-josiah-devines-projects.vercel.app';

console.log('API Base URL:', baseURL);
console.log('Environment:', process.env.NODE_ENV);

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request logging
api.interceptors.request.use((config) => {
  console.log('Making request to:', `${baseURL}${config.url}`);
  console.log('Request data:', config.data);
  console.log('Request headers:', config.headers);
  
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  console.error('Request error:', error);
  return Promise.reject(error);
});

// Add response logging
api.interceptors.response.use(
  (response) => {
    console.log('Response:', response.data);
    return response;
  },
  (error) => {
    console.error('Response error:', error.response || error);
    console.error('Full error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers
    });
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const auth = {
  login: async (credentials) => {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },
  register: async (userData) => {
    console.log('Registering with data:', userData);
    try {
      const response = await api.post('/api/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }
};

export const plaid = {
  createLinkToken: async () => {
    const response = await api.post('/api/plaid/create-link-token');
    return response.data;
  },
  exchangeToken: async (publicToken, metadata) => {
    const response = await api.post('/api/plaid/exchange-token', { public_token: publicToken, institution: metadata });
    return response.data;
  },
  getAccounts: async () => {
    const response = await api.get('/api/plaid/accounts');
    return response.data;
  },
  syncBalances: async () => {
    const response = await api.post('/api/plaid/sync-balances');
    return response.data;
  }
};

export default api; 