import axios from 'axios';
import { getToken } from './auth';
import { log, logError } from '../utils/logger';
import { ensureAuth } from './firebase';

const getBaseURL = () => {
  const hostname = window.location.hostname;
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    return `https://${hostname}/.netlify/functions`;
  }
  
  return 'http://localhost:8888/.netlify/functions';
};

// Create an axios instance with a base URL
const _isDevelopment = process.env.NODE_ENV === 'development';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || getBaseURL();

// Define API endpoints
const AUTH_ENDPOINTS = {
  login: '/.netlify/functions/auth-login',
  logout: '/.netlify/functions/auth-logout',
  verify: '/.netlify/functions/auth-verify'
};

log('API', `Client initialized with:`, { 
  baseURL: API_BASE_URL,
  environment: process.env.NODE_ENV,
  hostname: window.location.hostname
});

// Create and export the API service
let apiService = null;

// Initialize the API service
const initializeApiService = async () => {
  try {
    // Ensure Firebase auth is initialized
    await ensureAuth();
    
    // Create axios instance with default config
    const api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000, // 30 second timeout
      headers: {
        'Content-Type': 'application/json',
      },
      validateStatus: (status) => status >= 200 && status < 500,
      withCredentials: true
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
        config.timestamp = Date.now();
        
        // Add request ID to headers
        config.headers['X-Request-ID'] = requestId;
        
        // Add environment info to headers
        config.headers['X-Environment'] = process.env.NODE_ENV;
        
        // Handle URL paths for Netlify Functions
        if (config.url.startsWith('/api/')) {
          config.url = config.url.replace('/api/', '/');
          log('API', `Transformed URL from /api/ prefix: ${config.url}`);
        }
        
        // Add auth token if available
        try {
          const token = await getToken();
          if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
            log('API', 'Auth token added to request', { hasToken: true });
          } else {
            log('API', 'No auth token available for request');
          }
        } catch (error) {
          logError('API', 'Error getting auth token', error);
        }
        
        // Log outgoing request (redact sensitive data)
        const logData = {
          method: config.method.toUpperCase(),
          url: config.url,
          requestId,
          headers: { ...config.headers }
        };
        
        // Redact sensitive headers
        if (logData.headers.Authorization) {
          logData.headers.Authorization = 'Bearer [REDACTED]';
        }
        
        log('API', `Request: ${config.method.toUpperCase()} ${config.url}`, logData);
        
        return config;
      },
      error => {
        logError('API', 'Request error', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for logging and error handling
    api.interceptors.response.use(
      response => {
        log('API', `Response ${response.status} from ${response.config.url}`, {
          requestId: response.config.requestId,
          timing: Date.now() - new Date(response.config.timestamp)
        });
        return response;
      },
      async error => {
        const requestId = error.config?.requestId;
        let errorMessage = 'An unknown error occurred';
        let errorCode = 'UNKNOWN_ERROR';
        
        // Specifically check for CORS errors
        if (error.message && error.message.includes('Network Error')) {
          errorCode = 'CORS_ERROR';
          errorMessage = 'Network error: This may be due to CORS restrictions. Check that the server allows credentials and has proper CORS headers.';
          
          logError('API', 'CORS Error detected', { 
            requestId,
            error: error.message,
            code: errorCode,
            url: error.config?.url,
            withCredentials: error.config?.withCredentials,
            baseURL: error.config?.baseURL
          });
          
          error.isCorsError = true;
          error.userMessage = errorMessage;
          error.code = errorCode;
          
          return Promise.reject(error);
        }
        
        if (error.response) {
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
        } else if (!error.response) {
          errorCode = 'NETWORK_ERROR';
          errorMessage = 'No response received from server. Please check your internet connection.';
          logError('API', `No response received from ${error.config.url}`, {
            requestId,
            error,
            code: errorCode
          });
        } else {
          errorCode = 'REQUEST_SETUP_ERROR';
          errorMessage = error.message || errorMessage;
          logError('API', 'Error setting up request', {
            requestId,
            error,
            code: errorCode
          });
        }
        
        error.userMessage = errorMessage;
        error.code = errorCode;
        error.requestId = requestId;
        
        return Promise.reject(error);
      }
    );

    return api;
  } catch (error) {
    logError('API', 'Failed to initialize API service', error);
    throw error;
  }
};

// Initialize the API service with retries
let initRetryCount = 0;
const MAX_INIT_RETRIES = 3;

const initializeWithRetry = async () => {
  while (initRetryCount < MAX_INIT_RETRIES) {
    try {
      const api = await initializeApiService();
      if (api) {
        apiService = {
          // Authentication
          login: async (email, password) => {
            try {
              const response = await api.post(AUTH_ENDPOINTS.login, { email, password });
              if (response.data.token) {
                localStorage.setItem('authToken', response.data.token);
                api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
              }
              return response.data;
            } catch (error) {
              logError('API', 'Login error', error);
              throw error;
            }
          },
          
          logout: async () => {
            const response = await api.post(AUTH_ENDPOINTS.logout);
            return response.data;
          },
          
          // Plaid API
          getPlaidLinkToken: async (userId) => {
            const response = await api.post('/plaid-link-token', { user_id: userId });
            return response.data;
          },
          
          exchangePlaidPublicToken: async (publicToken, userId) => {
            const response = await api.post('/plaid-exchange-token', { 
              public_token: publicToken,
              user_id: userId,
              metadata: {
                environment: process.env.NODE_ENV,
                timestamp: new Date().toISOString()
              }
            });
            return response.data;
          },
          
          getPlaidAccounts: async () => {
            const response = await api.get('/plaid-accounts');
            return response.data;
          },
          
          getPlaidStatus: async () => {
            try {
              const response = await api.get('/plaid-status');
              return response.data;
            } catch (error) {
              if (error.response?.status === 403) {
                const err = new Error('Access denied');
                err.details = 'You need to connect your accounts to view analytics.';
                err.code = 'ACCOUNTS_NOT_CONNECTED';
                throw err;
              }
              throw error;
            }
          },
          
          getTransactionsAnalytics: async (params) => {
            try {
              const response = await api.get('/transactions-analytics', { params });
              return response.data;
            } catch (error) {
              if (error.response?.status === 403) {
                const err = new Error('Access denied');
                err.details = 'You need to connect your accounts to view analytics.';
                err.code = 'ACCOUNTS_NOT_CONNECTED';
                throw err;
              }
              throw error;
            }
          },
          
          getBalanceHistory: async (params) => {
            try {
              const response = await api.get('/plaid-balance-history', { params });
              return response.data;
            } catch (error) {
              if (error.response?.status === 403) {
                const err = new Error('Access denied');
                err.details = 'You need to connect your accounts to view balance history.';
                err.code = 'ACCOUNTS_NOT_CONNECTED';
                throw err;
              }
              throw error;
            }
          },
          
          // Salary Entries
          getSalaryEntries: async (params) => {
            try {
              const response = await api.get('/api/salary-journal', { params });
              return response.data;
            } catch (error) {
              logError('API', 'Error fetching salary entries', error);
              const err = new Error('Failed to fetch salary entries');
              err.details = error.response?.data?.message || error.message;
              err.code = error.response?.status || 'UNKNOWN_ERROR';
              throw err;
            }
          },
          
          createSalaryEntry: async (salaryData) => {
            try {
              const response = await api.post('/api/salary-journal', salaryData);
              return response.data;
            } catch (error) {
              logError('API', 'Error creating salary entry', error);
              const err = new Error('Failed to create salary entry');
              err.details = error.response?.data?.message || error.message;
              err.code = error.response?.status || 'UNKNOWN_ERROR';
              throw err;
            }
          },
          
          updateSalaryEntry: async (id, salaryData) => {
            try {
              const response = await api.put(`/api/salary-journal/${id}`, salaryData);
              return response.data;
            } catch (error) {
              logError('API', 'Error updating salary entry', error);
              const err = new Error('Failed to update salary entry');
              err.details = error.response?.data?.message || error.message;
              err.code = error.response?.status || 'UNKNOWN_ERROR';
              throw err;
            }
          },
          
          deleteSalaryEntry: async (id) => {
            try {
              const response = await api.delete(`/api/salary-journal/${id}`);
              return response.data;
            } catch (error) {
              logError('API', 'Error deleting salary entry', error);
              const err = new Error('Failed to delete salary entry');
              err.details = error.response?.data?.message || error.message;
              err.code = error.response?.status || 'UNKNOWN_ERROR';
              throw err;
            }
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
          
          // Health check
          checkHealth: async () => {
            try {
              const response = await api.get('/api-status');
              log('API', 'Health check successful', response.data);
              return { status: 'healthy', data: response.data };
            } catch (error) {
              logError('API', 'Health check failed', error);
              return { status: 'unhealthy', error };
            }
          }
        };
        
        log('API', 'API service initialized successfully');
        return apiService;
      }
      throw new Error('API initialization failed');
    } catch (error) {
      initRetryCount++;
      if (initRetryCount >= MAX_INIT_RETRIES) {
        logError('API', 'API initialization failed after retries', error);
        throw error;
      }
      const delay = Math.min(1000 * Math.pow(2, initRetryCount), 8000);
      log('API', `Retrying API initialization in ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Start initialization
initializeWithRetry().catch(error => {
  logError('API', 'Failed to initialize API service after retries', error);
});

// Export a proxy to handle methods being called before initialization
export default new Proxy({}, {
  get: (target, prop) => {
    if (!apiService) {
      return async (...args) => {
        if (!apiService) {
          try {
            await initializeWithRetry();
          } catch (error) {
            logError('API', 'API service not initialized', error);
            throw new Error('API service not initialized');
          }
        }
        return apiService[prop](...args);
      };
    }
    return apiService[prop];
  }
}); 