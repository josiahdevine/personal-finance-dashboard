import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import { Prisma } from '@prisma/client';
import { ApiError } from '../types/models';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
const API_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000', 10);

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class Api {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        // Add request ID for tracing
        config.headers['X-Request-ID'] = crypto.randomUUID();
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response) {
          throw new ApiError(
            error.response.status,
            error.response.data?.message || 'An error occurred',
            error.response.data
          );
        }
        throw error;
      }
    );
  }

  async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    try {
      const response = await this.client.get<T>(url, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async post<T>(url: string, data?: any): Promise<T> {
    try {
      const response = await this.client.post<T>(url, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async put<T>(url: string, data: any): Promise<T> {
    try {
      const response = await this.client.put<T>(url, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete<T>(url: string): Promise<T> {
    try {
      const response = await this.client.delete<T>(url);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async patch<T>(url: string, data: any): Promise<T> {
    try {
      const response = await this.client.patch<T>(url, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: unknown): never {
    if (axios.isAxiosError(error)) {
      const response = error.response;
      if (response) {
        throw new ApiError(
          response.status,
          response.data?.message || 'An error occurred',
          response.data
        );
      }
      throw new ApiError(500, 'Network error', { isNetworkError: true });
    }
    throw error;
  }
}

export const api = new Api();

// Error types
export interface ApiResponse<T> {
  data: T;
  status: number;
  success: boolean;
  metadata?: {
    page?: number;
    limit?: number;
    total?: number;
    timestamp: string;
  };
}

interface ApiErrorResponse {
  message?: string;
  code?: string;
  details?: Record<string, any>;
}

// Error mapping
const errorMap = new Map<string, { status: number; code: string; message: string }>([
  ['P2002', { status: 409, code: 'UNIQUE_VIOLATION', message: 'Resource already exists' }],
  ['P2025', { status: 404, code: 'NOT_FOUND', message: 'Resource not found' }],
  ['P2003', { status: 400, code: 'FOREIGN_KEY_VIOLATION', message: 'Invalid reference' }],
  ['P2014', { status: 400, code: 'INVALID_QUERY', message: 'Invalid query parameters' }],
  ['P2021', { status: 500, code: 'TABLE_NOT_FOUND', message: 'Database table not found' }],
]);

// Manual Accounts API
export interface ManualAccountResponse {
  id: string;
  user_id: string;
  account_name: string;
  account_type: 'checking' | 'savings' | 'credit' | 'investment' | 'other';
  balance: number;
  currency: string;
  institution?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const manualAccountsApi = {
  getUserAccounts: async (userId: string): Promise<ApiResponse<ManualAccountResponse[]>> => {
    try {
      const response = await api.get(`/manual-accounts/user/${userId}`);
      return {
        data: response.data,
        status: response.status,
        success: true,
      };
    } catch (error) {
      throw error;
    }
  },

  createAccount: async (account: Omit<ManualAccountResponse, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<ManualAccountResponse>> => {
    try {
      const response = await api.post('/manual-accounts', account);
      return {
        data: response.data,
        status: response.status,
        success: true,
      };
    } catch (error) {
      throw error;
    }
  },

  updateAccount: async (id: string, account: Partial<Omit<ManualAccountResponse, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<ApiResponse<ManualAccountResponse>> => {
    try {
      const response = await api.put(`/manual-accounts/${id}`, account);
      return {
        data: response.data,
        status: response.status,
        success: true,
      };
    } catch (error) {
      throw error;
    }
  },

  deleteAccount: async (id: string): Promise<ApiResponse<void>> => {
    try {
      const response = await api.delete(`/manual-accounts/${id}`);
      return {
        data: undefined,
        status: response.status,
        success: true,
      };
    } catch (error) {
      throw error;
    }
  },

  updateBalance: async (id: string, balance: number): Promise<ApiResponse<ManualAccountResponse>> => {
    try {
      const response = await api.patch(`/manual-accounts/${id}/balance`, { balance });
      return {
        data: response.data,
        status: response.status,
        success: true,
      };
    } catch (error) {
      throw error;
    }
  }
};

// Export the api instance for direct use if needed
export default api;
