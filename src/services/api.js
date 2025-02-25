import axios from 'axios';
import { auth } from './firebase';

// API Base URL selection
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.trypersonalfinance.com';

// Debug logging
console.log('API Base URL:', API_BASE_URL);
console.log('Environment:', process.env.NODE_ENV);
console.log('Window origin:', window.location.origin);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // This is crucial for cookies/sessions
  timeout: 15000, // 15 seconds timeout
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    // Log the request details
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      origin: window.location.origin,
      headers: config.headers,
    });

    // Get the current user from Firebase
    const user = auth.currentUser;

    if (user) {
      try {
        // Get the Firebase ID token
        const token = await user.getIdToken(true);
        config.headers['Authorization'] = `Bearer ${token}`;
        console.log('Added Firebase token to request');
      } catch (error) {
        console.error('Error getting Firebase token:', error);
      }
    } else {
      console.log('No authenticated user found');
    }

    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error('API Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      response: error.response?.data,
    });

    // Handle CORS errors specifically
    if (error.message.includes('Network Error') || !error.response) {
      console.error('Possible CORS error or network issue');
      console.error('Request details:', {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
        baseURL: error.config?.baseURL,
        withCredentials: error.config?.withCredentials,
      });
    }

    return Promise.reject(error);
  }
);

// API service functions
const apiService = {
  // Auth endpoints
  login: async (credentials) => {
    try {
      console.log('Sending login request to:', `${API_BASE_URL}/auth/login`);
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  register: async (userData) => {
    try {
      console.log('Sending register request to:', `${API_BASE_URL}/auth/register`);
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },

  // Plaid endpoints
  createLinkToken: async () => {
    try {
      const response = await api.post('/plaid/create-link-token');
      return response.data;
    } catch (error) {
      console.error('Create link token error:', error);
      throw error;
    }
  },

  exchangePublicToken: async (publicToken) => {
    try {
      const response = await api.post('/plaid/exchange-public-token', { publicToken });
      return response.data;
    } catch (error) {
      console.error('Exchange public token error:', error);
      throw error;
    }
  },

  // Transactions endpoints
  getTransactions: async (startDate, endDate) => {
    try {
      const response = await api.get('/plaid/transactions', {
        params: { start_date: startDate, end_date: endDate }
      });
      return response.data;
    } catch (error) {
      console.error('Get transactions error:', error);
      throw error;
    }
  },

  // Accounts endpoints
  getAccounts: async () => {
    try {
      const response = await api.get('/plaid/accounts');
      return response.data;
    } catch (error) {
      console.error('Get accounts error:', error);
      throw error;
    }
  },

  // Bills endpoints
  getBills: async () => {
    try {
      const response = await api.get('/plaid/bills');
      return response.data;
    } catch (error) {
      console.error('Get bills error:', error);
      throw error;
    }
  },

  // Generic data fetching method
  fetchData: async (endpoint, params = {}) => {
    try {
      console.log(`Fetching data from ${endpoint} with params:`, params);
      const response = await api.get(endpoint, { params });
      return response.data;
    } catch (error) {
      console.error(`Error fetching data from ${endpoint}:`, error);
      throw error;
    }
  },

  // Generic post method
  postData: async (endpoint, data = {}) => {
    try {
      console.log(`Posting data to ${endpoint}:`, data);
      const response = await api.post(endpoint, data);
      return response.data;
    } catch (error) {
      console.error(`Error posting data to ${endpoint}:`, error);
      throw error;
    }
  }
};

// For backward compatibility with components that use authService
export const authService = {
  loginWithJWT: apiService.login,
  registerWithJWT: apiService.register
};

export default apiService; 