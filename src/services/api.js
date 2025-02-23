import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://personal-finance-dashboard-gv4s030m3-josiah-devines-projects.vercel.app'
  : 'http://localhost:5000';

console.log('API Base URL:', API_BASE_URL);
console.log('Environment:', process.env.NODE_ENV);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle specific error cases
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          // Forbidden
          console.error('Access forbidden:', error.response.data);
          break;
        case 500:
          // Server error
          console.error('Server error:', error.response.data);
          break;
        default:
          console.error('API error:', error.response.data);
      }
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