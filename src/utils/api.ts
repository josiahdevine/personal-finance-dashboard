import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth token
api.interceptors.request.use(
  async (config) => {
    // Get the token from localStorage or wherever you store it
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access (e.g., redirect to login)
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Handle API errors in a consistent way
export const handleApiError = (error: any, res: any) => {
  console.error('API Error:', error);
  
  const status = error.status || 500;
  const message = error.message || 'Internal Server Error';
  
  return res.status(status).json({
    error: true,
    message,
    details: error.data || {}
  });
}; 