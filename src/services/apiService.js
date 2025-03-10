import axios from 'axios';

// Base URL configuration
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8889/.netlify/functions';

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  // Set this to false to avoid CORS issues with wildcard origins
  withCredentials: false
});

// Add request interceptor for auth token
api.interceptors.request.use(
  async (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request ID for tracing
    config.headers['X-Request-ID'] = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for common error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle auth errors
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      
      // Don't redirect if we're already on the login page to avoid loops
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    // Pass through the error
    return Promise.reject(error);
  }
);

// API functions
export const apiService = {
  // Health check with fallback mechanism
  checkHealth: async () => {
    try {
      // Try the regular health check endpoint first
      const response = await api.get('/health-check');
      return response.data;
    } catch (error) {
      console.warn('Primary health check failed, trying fallback:', error.message);
      
      try {
        // Try the simplified health check as fallback
        const fallbackResponse = await api.get('/simple-health-check');
        return fallbackResponse.data;
      } catch (fallbackError) {
        console.error('API health check failed:', fallbackError);
        // Re-throw to let calling code handle it
        throw fallbackError;
      }
    }
  },
  
  // Auth endpoints
  auth: {
    login: async (credentials) => {
      try {
        const response = await api.post('/auth-login', credentials);
        return response.data;
      } catch (error) {
        console.warn('Primary login failed, trying fallback:', error.message);
        
        try {
          // Try the simplified auth login as fallback
          const fallbackResponse = await api.post('/auth-login-simple', credentials);
          return fallbackResponse.data;
        } catch (fallbackError) {
          console.error('Login failed:', fallbackError);
          throw fallbackError;
        }
      }
    },
    
    logout: async () => {
      try {
        const response = await api.post('/auth-logout');
        return response.data;
      } catch (error) {
        console.warn('Logout failed, but continuing anyway:', error.message);
        // Clear local auth data even if the server call fails
        localStorage.removeItem('auth_token');
        return { success: true, message: 'Local logout successful' };
      }
    }
  },
  
  // Example of a protected endpoint
  user: {
    getProfile: async () => {
      const response = await api.get('/user/profile');
      return response.data;
    },
    
    updateProfile: async (profileData) => {
      const response = await api.put('/user/profile', profileData);
      return response.data;
    }
  }
};

export default apiService; 