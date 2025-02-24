import axios from 'axios';

// Use the actual backend URL where your server is deployed
const API_BASE_URL = 'https://personal-finance-dashboard-10aeyrb89-josiah-devines-projects.vercel.app';

console.log('API Base URL:', API_BASE_URL);
console.log('Environment:', process.env.NODE_ENV);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true,
  timeout: 30000
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request details in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Request:', {
        url: config.url,
        method: config.method,
        headers: config.headers,
        data: config.data
      });
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Response:', {
        status: response.status,
        data: response.data
      });
    }
    return response;
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
      return Promise.reject({
        message: 'Network error occurred. Please check your connection.',
        originalError: error
      });
    }

    // Handle API errors
    const errorResponse = {
      status: error.response.status,
      data: error.response.data,
      message: error.response.data?.message || 'An error occurred'
    };

    // Log error details
    console.error('API Error:', errorResponse);

    // Handle specific status codes
    switch (error.response.status) {
      case 401:
        localStorage.removeItem('authToken');
        window.location.href = '/login';
        break;
      case 403:
        console.error('Access forbidden:', errorResponse.message);
        break;
      case 500:
        console.error('Server error:', errorResponse.message);
        break;
      default:
        console.error('API error:', errorResponse.message);
    }

    return Promise.reject(errorResponse);
  }
);

// Auth service
export const auth = {
  login: async (credentials) => {
    try {
      const response = await api.post('/api/auth/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  register: async (userData) => {
    try {
      const response = await api.post('/api/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }
};

// Plaid service
export const plaid = {
  createLinkToken: async () => {
    try {
      const response = await api.post('/api/plaid/create-link-token');
      return response.data;
    } catch (error) {
      console.error('Create link token error:', error);
      throw error;
    }
  },
  exchangeToken: async (publicToken, metadata) => {
    try {
      const response = await api.post('/api/plaid/exchange-token', {
        public_token: publicToken,
        institution: metadata
      });
      return response.data;
    } catch (error) {
      console.error('Exchange token error:', error);
      throw error;
    }
  },
  getAccounts: async () => {
    try {
      const response = await api.get('/api/plaid/accounts');
      return response.data;
    } catch (error) {
      console.error('Get accounts error:', error);
      throw error;
    }
  },
  syncBalances: async () => {
    try {
      const response = await api.post('/api/plaid/sync-balances');
      return response.data;
    } catch (error) {
      console.error('Sync balances error:', error);
      throw error;
    }
  }
};

export default api; 