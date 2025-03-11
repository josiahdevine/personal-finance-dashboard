import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import logger from '../utils/logger';

// API error class with improved type safety
export class ApiError extends Error {
  public status: number;
  public data: any;
  public isNetworkError: boolean;
  
  constructor(message: string, status = 500, data: any = null, isNetworkError = false) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.isNetworkError = isNetworkError;
  }
}

// Get auth token from storage
export const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Create API instance
const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: process.env.REACT_APP_API_URL || '/api',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  // Request interceptor
  instance.interceptors.request.use(
    (config) => {
      // Log the request
      logger.info(
        'API', 
        `Request: ${config.method?.toUpperCase()} ${config.url}`, 
        config.params || config.data
      );
      
      // Add auth token if available
      const token = getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    },
    (error) => {
      const err = error instanceof Error ? error : new Error('Unknown request error');
      logger.error('API', 'Request error', err);
      return Promise.reject(error);
    }
  );
  
  // Response interceptor to standardize responses and ensure they have a data property
  instance.interceptors.response.use(
    (response) => {
      // Log the response
      logger.info(
        'API',
        `Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`,
        response.data
      );
      
      // If the response is not an object with a data property, wrap it in a data property
      if (response && typeof response.data === 'object' && !response.data.hasOwnProperty('data')) {
        response.data = { data: response.data };
      }
      
      return response;
    },
    (error: AxiosError) => {
      if (error.response) {
        // Server responded with error status
        const errorData = error.response.data as any;
        const errorMessage = errorData?.message || 'Server error';
        
        // Create an Error object from the error message for proper logging
        const serverError = new Error(errorMessage);
        
        logger.error(
          'API',
          `Error ${error.response.status}: ${error.response.config.method?.toUpperCase()} ${error.response.config.url}`,
          serverError,
          error.response.data
        );
        
        throw new ApiError(
          errorMessage,
          error.response.status,
          error.response.data,
          false
        );
      } else if (error.request) {
        // Request made but no response
        const networkError = new Error('Network error: No response received');
        logger.error('API', networkError.message, networkError);
        throw new ApiError(
          'Network error: Unable to reach server',
          0,
          null,
          true
        );
      } else {
        // Request setup error
        const setupError = error instanceof Error ? error : new Error('Unknown request setup error');
        logger.error('API', 'Request setup error', setupError);
        throw new ApiError(setupError.message, 0, null, false);
      }
    }
  );
  
  return instance;
};

const apiInstance = createApiInstance();

// Type-safe API methods
export const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return apiInstance.get(url, config).then(response => response.data);
  },
  
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return apiInstance.post(url, data, config).then(response => response.data);
  },
  
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return apiInstance.put(url, data, config).then(response => response.data);
  },
  
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return apiInstance.patch(url, data, config).then(response => response.data);
  },
  
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return apiInstance.delete(url, config).then(response => response.data);
  },
};

export default api;
