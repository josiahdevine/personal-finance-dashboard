import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';

// API Configuration
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Error types
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: any,
    public isNetworkError: boolean = false
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const handleApiError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      throw new ApiError(
        error.response.status,
        error.response.data?.message || 'An error occurred',
        error.response.data,
        false
      );
    } else {
      // Network error (no response)
      throw new ApiError(
        500,
        'Network error - unable to connect to the server',
        undefined,
        true
      );
    }
  }
  throw new ApiError(500, error instanceof Error ? error.message : 'Network error', undefined, true);
};

export const get = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response = await axios.get<T>(url, config);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const post = async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response = await axios.post<T>(url, data, config);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const put = async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response = await axios.put<T>(url, data, config);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const del = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response = await axios.delete<T>(url, config);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const patch = async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response = await axios.patch<T>(url, data, config);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
