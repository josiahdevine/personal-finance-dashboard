import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { getAuth } from 'firebase/auth';

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  retry?: number;
  retryCount?: number;
}

// Create a custom instance of axios
const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  timeout: 30000, // Increased to 30 seconds
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add custom defaults
const customDefaults = {
  retry: 3,
  retryDelay: (retryCount: number) => {
    return retryCount * 1000; // time interval between retries
  }
};

// Add request interceptor to add Firebase ID token
axiosInstance.interceptors.request.use(
  async (config) => {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (user) {
      try {
        const token = await user.getIdToken();
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.error('Error getting auth token:', error);
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors and retries
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config as CustomAxiosRequestConfig;
    const status = error.response?.status;
    
    // Retry the request if we have retries left and it's a network error or 5xx error
    if (config && (error.code === 'ECONNABORTED' || (status >= 500 && status <= 599))) {
      config.retry = config.retry ?? customDefaults.retry;
      config.retryCount = config.retryCount ?? 0;
      
      if (config.retryCount < config.retry) {
        config.retryCount += 1;
        const delay = customDefaults.retryDelay(config.retryCount);
        
        // Wait for the delay before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return axiosInstance(config);
      }
    }
    
    if (status === 401) {
      // Redirect to login on auth errors
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance; 