import { useState, useCallback } from 'react';
import { api } from '../services/api';
import logger from '../utils/logger';

interface ApiRequestState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

interface ApiRequestOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

interface ApiResponse<T> {
  data: T;
  [key: string]: any;
}

export function useApiRequest<T>(options: ApiRequestOptions = {}) {
  const [state, setState] = useState<ApiRequestState<T>>({
    data: null,
    isLoading: false,
    error: null
  });
  
  // Make a GET request
  const get = useCallback(async (url: string, params?: any) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await api.get<ApiResponse<T>>(url, { params });
      setState({ data: response.data.data, isLoading: false, error: null });
      
      if (options.onSuccess) {
        options.onSuccess(response.data.data);
      }
      
      return response.data.data;
    } catch (error: any) {
      logger.error('API', `GET request failed: ${url}`, error);
      setState({ data: null, isLoading: false, error });
      
      if (options.onError) {
        options.onError(error);
      }
      
      throw error;
    }
  }, [options]);
  
  // Make a POST request
  const post = useCallback(async (url: string, data?: any) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await api.post<ApiResponse<T>>(url, data);
      setState({ data: response.data.data, isLoading: false, error: null });
      
      if (options.onSuccess) {
        options.onSuccess(response.data.data);
      }
      
      return response.data.data;
    } catch (error: any) {
      logger.error('API', `POST request failed: ${url}`, error);
      setState({ data: null, isLoading: false, error });
      
      if (options.onError) {
        options.onError(error);
      }
      
      throw error;
    }
  }, [options]);
  
  // Make a PUT request
  const put = useCallback(async (url: string, data?: any) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await api.put<ApiResponse<T>>(url, data);
      setState({ data: response.data.data, isLoading: false, error: null });
      
      if (options.onSuccess) {
        options.onSuccess(response.data.data);
      }
      
      return response.data.data;
    } catch (error: any) {
      logger.error('API', `PUT request failed: ${url}`, error);
      setState({ data: null, isLoading: false, error });
      
      if (options.onError) {
        options.onError(error);
      }
      
      throw error;
    }
  }, [options]);
  
  // Make a PATCH request
  const patch = useCallback(async (url: string, data?: any) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await api.patch<ApiResponse<T>>(url, data);
      setState({ data: response.data.data, isLoading: false, error: null });
      
      if (options.onSuccess) {
        options.onSuccess(response.data.data);
      }
      
      return response.data.data;
    } catch (error: any) {
      logger.error('API', `PATCH request failed: ${url}`, error);
      setState({ data: null, isLoading: false, error });
      
      if (options.onError) {
        options.onError(error);
      }
      
      throw error;
    }
  }, [options]);
  
  // Make a DELETE request
  const del = useCallback(async (url: string, params?: any) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await api.delete<ApiResponse<T>>(url, { params });
      setState({ data: response.data.data, isLoading: false, error: null });
      
      if (options.onSuccess) {
        options.onSuccess(response.data.data);
      }
      
      return response.data.data;
    } catch (error: any) {
      logger.error('API', `DELETE request failed: ${url}`, error);
      setState({ data: null, isLoading: false, error });
      
      if (options.onError) {
        options.onError(error);
      }
      
      throw error;
    }
  }, [options]);
  
  return {
    ...state,
    get,
    post,
    put,
    patch,
    delete: del
  };
}