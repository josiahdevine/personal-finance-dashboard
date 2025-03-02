import axios from 'axios';
import { getToken } from './auth';
import { log, logError } from '../utils/logger';

// Create an axios instance with a base URL
const isDevelopment = process.env.NODE_ENV === 'development';
const API_BASE_URL = isDevelopment 
  ? 'http://localhost:8888/.netlify/functions'
  : 'https://api.trypersonalfinance.com';

log('API', `Initializing API with base URL: ${API_BASE_URL}`, { 
  environment: process.env.NODE_ENV,
  isDevelopment,
  hostname: window.location.hostname
});

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
  validateStatus: (status) => status >= 200 && status < 500, // Don't reject if status is 2xx/3xx/4xx
  withCredentials: true // Enable credentials for CORS
});

// Generate request ID
const generateRequestId = () => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Request interceptor for adding auth token and logging
api.interceptors.request.use(
  async config => {
    const requestId = generateRequestId();
    config.requestId = requestId;
    
    // Add request ID to headers
    config.headers['X-Request-ID'] = requestId;
    
    // Add environment info to headers
    config.headers['X-Environment'] = process.env.NODE_ENV;
    
    // Remove /api prefix since Netlify Functions don't use it
    if (config.url.startsWith('/api/')) {
      config.url = config.url.replace('/api/', '/');
    }
    
    // Log API request
    log('API', `${config.method?.toUpperCase() || 'REQUEST'} ${config.url}`, { 
      requestId,
      params: config.params,
      data: config.data,
      baseURL: config.baseURL,
      fullUrl: `${config.baseURL}${config.url}`
    });
    
    try {
      // Add auth token to every request
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      logError('API', 'Failed to get auth token for request', {
        error,
        requestId
      });
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
      requestId: response.config.requestId,
      data: response.data,
      timing: Date.now() - new Date(response.config.timestamp)
    });
    return response;
  },
  async error => {
    const requestId = error.config?.requestId;
    let errorMessage = 'An unknown error occurred';
    let errorCode = 'UNKNOWN_ERROR';
    
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data;
      
      errorMessage = data.message || data.error || `Error ${status}`;
      errorCode = data.code || `HTTP_${status}`;
      
      logError('API', `Error ${status} from ${error.config.url}`, { 
        requestId,
        error: errorMessage,
        code: errorCode,
        data: data
      });
      
      // Handle specific error codes
      switch (status) {
        case 401:
          errorCode = 'UNAUTHORIZED';
          errorMessage = 'Your session has expired. Please login again.';
          // Trigger logout or token refresh here
          break;
        case 403:
          errorCode = 'FORBIDDEN';
          errorMessage = 'You don\'t have permission to access this resource.';
          break;
        case 404:
          errorCode = 'NOT_FOUND';
          errorMessage = 'The requested resource was not found.';
          break;
        case 429:
          errorCode = 'RATE_LIMITED';
          errorMessage = 'Too many requests. Please try again later.';
          break;
        default:
          if (status >= 500) {
            errorCode = 'SERVER_ERROR';
            errorMessage = 'A server error occurred. Please try again later.';
          }
      }
    } else if (error.request) {
      // Request made but no response received
      errorCode = 'NETWORK_ERROR';
      errorMessage = 'No response received from server. Please check your internet connection.';
      logError('API', `No response received from ${error.config.url}`, {
        requestId,
        error,
        code: errorCode
      });
    } else {
      // Error setting up request
      errorCode = 'REQUEST_SETUP_ERROR';
      errorMessage = error.message || errorMessage;
      logError('API', 'Error setting up request', {
        requestId,
        error,
        code: errorCode
      });
    }
    
    // Enhance error object with additional information
    error.userMessage = errorMessage;
    error.code = errorCode;
    error.requestId = requestId;
    
    return Promise.reject(error);
  }
);

// API function definitions
const apiService = {
  // Authentication
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
  
  // Plaid API
  getPlaidLinkToken: async () => {
    const response = await api.post('/plaid/link-token');
    return response.data;
  },
  
  exchangePlaidPublicToken: async (publicToken) => {
    const response = await api.post('/plaid/exchange-token', { 
      publicToken,
      metadata: {
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
      }
    });
    return response.data;
  },
  
  getPlaidAccounts: async () => {
    const response = await api.get('/plaid/accounts');
    return response.data;
  },
  
  getPlaidTransactions: async (params) => {
    const response = await api.get('/plaid/transactions', { 
      params: {
        ...params,
        environment: process.env.NODE_ENV
      }
    });
    return response.data;
  },
  
  getPlaidStatus: async () => {
    const response = await api.get('/plaid/status', {
      params: {
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
      }
    });
    return response.data;
  },
  
  // Salary Entries
  getSalaryEntries: async (params) => {
    const response = await api.get('/salary-entries', { params });
    return response.data;
  },
  
  createSalaryEntry: async (salaryData) => {
    const response = await api.post('/salary-entries', salaryData);
    return response.data;
  },
  
  updateSalaryEntry: async (id, salaryData) => {
    const response = await api.put(`/salary-entries/${id}`, salaryData);
    return response.data;
  },
  
  deleteSalaryEntry: async (id) => {
    const response = await api.delete(`/salary-entries/${id}`);
    return response.data;
  },
  
  // Financial Goals
  getGoals: async () => {
    const response = await api.get('/goals');
    return response.data;
  },
  
  createGoal: async (goalData) => {
    const response = await api.post('/goals', goalData);
    return response.data;
  },
  
  updateGoal: async (id, goalData) => {
    const response = await api.put(`/goals/${id}`, goalData);
    return response.data;
  },
  
  deleteGoal: async (id) => {
    const response = await api.delete(`/goals/${id}`);
    return response.data;
  },
  
  // System status
  getHealthStatus: async () => {
    const response = await api.get('/health');
    return response.data;
  },
  
  // Admin endpoints (protected by admin role)
  getAdminStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },
  
  getUserStats: async () => {
    const response = await api.get('/user/stats');
    return response.data;
  },
  
  // Balance History
  getBalanceHistory: async (params) => {
    const response = await api.get('/plaid/balance-history', { 
      params: {
        ...params,
        environment: process.env.NODE_ENV
      }
    });
    return response.data;
  },
  
  // Utility to handle API errors
  handleApiError: (error, fallbackMessage = 'An error occurred') => {
    // Log the error for debugging
    logError('API', 'API error handler', {
      error,
      requestId: error.requestId,
      code: error.code
    });
    
    // Return a standardized error object
    return {
      message: error.userMessage || fallbackMessage,
      code: error.code || 'UNKNOWN_ERROR',
      status: error.response?.status || 500,
      requestId: error.requestId,
      details: error.response?.data || null
    };
  }
};

export default apiService; 