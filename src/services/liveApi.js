import axios from 'axios';
import { getToken } from './auth';
import { log, logError } from '../utils/logger';

// Create an axios instance with a base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.trypersonalfinance.com';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor for adding auth token and logging
api.interceptors.request.use(
  async config => {
    // Log API request
    log('API', `${config.method?.toUpperCase() || 'REQUEST'} ${config.url}`, { 
      params: config.params,
      data: config.data
    });
    
    try {
      // Add auth token to every request
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      logError('API', 'Failed to get auth token for request', error);
      return config;
    }
  },
  error => {
    logError('API', 'Request interceptor error', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging and error handling
api.interceptors.response.use(
  response => {
    // Log successful response
    log('API', `Response ${response.status} from ${response.config.url}`, {
      data: response.data
    });
    return response;
  },
  async error => {
    let errorMessage = 'An unknown error occurred';
    
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data;
      
      errorMessage = data.message || data.error || `Error ${status}`;
      logError('API', `Error ${status} from ${error.config.url}`, { 
        error: errorMessage,
        data: data
      });
      
      // Handle specific error codes
      if (status === 401) {
        // Unauthorized - token expired or invalid
        // You could trigger a logout or token refresh here
        errorMessage = 'Your session has expired. Please login again.';
      } else if (status === 403) {
        // Forbidden - user doesn't have permission
        errorMessage = 'You don\'t have permission to access this resource.';
      } else if (status === 404) {
        // Not found
        errorMessage = 'The requested resource was not found.';
      } else if (status >= 500) {
        // Server error
        errorMessage = 'A server error occurred. Please try again later.';
      }
    } else if (error.request) {
      // Request made but no response received
      logError('API', `No response received from ${error.config.url}`, error);
      errorMessage = 'No response received from server. Please check your internet connection.';
    } else {
      // Error setting up request
      logError('API', 'Error setting up request', error);
      errorMessage = error.message || errorMessage;
    }
    
    // Attach the error message to the error object for easy access
    error.userMessage = errorMessage;
    
    return Promise.reject(error);
  }
);

// API function definitions
const apiService = {
  // Authentication
  login: async (credentials) => {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/api/auth/logout');
    return response.data;
  },
  
  // Plaid API
  getPlaidLinkToken: async () => {
    const response = await api.post('/api/plaid/link-token');
    return response.data;
  },
  
  exchangePlaidPublicToken: async (publicToken) => {
    const response = await api.post('/api/plaid/exchange-token', { publicToken });
    return response.data;
  },
  
  getPlaidAccounts: async () => {
    const response = await api.get('/api/plaid/accounts');
    return response.data;
  },
  
  getPlaidTransactions: async (params) => {
    const response = await api.get('/api/plaid/transactions', { params });
    return response.data;
  },
  
  getPlaidStatus: async () => {
    const response = await api.get('/api/plaid/status');
    return response.data;
  },
  
  // Salary Entries
  getSalaryEntries: async (params) => {
    const response = await api.get('/api/salary-entries', { params });
    return response.data;
  },
  
  createSalaryEntry: async (salaryData) => {
    const response = await api.post('/api/salary-entries', salaryData);
    return response.data;
  },
  
  updateSalaryEntry: async (id, salaryData) => {
    const response = await api.put(`/api/salary-entries/${id}`, salaryData);
    return response.data;
  },
  
  deleteSalaryEntry: async (id) => {
    const response = await api.delete(`/api/salary-entries/${id}`);
    return response.data;
  },
  
  // Financial Goals
  getGoals: async () => {
    const response = await api.get('/api/goals');
    return response.data;
  },
  
  createGoal: async (goalData) => {
    const response = await api.post('/api/goals', goalData);
    return response.data;
  },
  
  updateGoal: async (id, goalData) => {
    const response = await api.put(`/api/goals/${id}`, goalData);
    return response.data;
  },
  
  deleteGoal: async (id) => {
    const response = await api.delete(`/api/goals/${id}`);
    return response.data;
  },
  
  // System status
  getHealthStatus: async () => {
    const response = await api.get('/health');
    return response.data;
  },
  
  // Admin endpoints (protected by admin role)
  getAdminStats: async () => {
    const response = await api.get('/api/admin/stats');
    return response.data;
  },
  
  getUserStats: async () => {
    const response = await api.get('/api/user/stats');
    return response.data;
  },
  
  // Utility to handle API errors
  handleApiError: (error, fallbackMessage = 'An error occurred') => {
    // Log the error for debugging
    logError('API', 'API error handler', error);
    
    // Return a standardized error object
    return {
      message: error.userMessage || fallbackMessage,
      status: error.response?.status || 500,
      details: error.response?.data || null,
      originalError: error
    };
  }
};

export default apiService; 