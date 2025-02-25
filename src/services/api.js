import axios from 'axios';
import { getToken } from './auth';

// Create an axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'https://api.trypersonalfinance.com',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    // Get the token from auth service or local storage
    const token = await getToken();
    
    // If token exists, add to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('API request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      // Handle authentication errors
      if (status === 401 || status === 403) {
        console.error('Authentication error:', data);
        // Redirect to login or trigger auth refresh
        // window.location.href = '/login';
      }
      
      // Handle server errors
      if (status >= 500) {
        console.error('Server error:', data);
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('No response received:', error.request);
    } else {
      // Error setting up request
      console.error('Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api; 