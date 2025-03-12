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

// Our API consistently returns responses with nested data structure
interface ApiResponseWrapper<T> {
  data: {
    data: T;
    message?: string;
    success?: boolean;
  };
  status: number;
  statusText: string;
  headers: any;
  config: any;
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
      const response = await api.get<any>(url, { params }) as ApiResponseWrapper<T>;
      const responseData = response.data.data;
      setState({ data: responseData, isLoading: false, error: null });
      
      if (options.onSuccess) {
        options.onSuccess(responseData);
      }
      
      return responseData;
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
      const response = await api.post<any>(url, data) as ApiResponseWrapper<T>;
      const responseData = response.data.data;
      setState({ data: responseData, isLoading: false, error: null });
      
      if (options.onSuccess) {
        options.onSuccess(responseData);
      }
      
      return responseData;
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
      const response = await api.put<any>(url, data) as ApiResponseWrapper<T>;
      const responseData = response.data.data;
      setState({ data: responseData, isLoading: false, error: null });
      
      if (options.onSuccess) {
        options.onSuccess(responseData);
      }
      
      return responseData;
    } catch (error: any) {
      logger.error('API', `PUT request failed: ${url}`, error);
      setState({ data: null, isLoading: false, error });
      
      if (options.onError) {
        options.onError(error);
      }
      
      throw error;
    }
  }, [options]);
  
  // Make a DELETE request
  const remove = useCallback(async (url: string, params?: any) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await api.delete<any>(url, { params }) as ApiResponseWrapper<T>;
      const responseData = response.data.data;
      setState({ data: responseData, isLoading: false, error: null });
      
      if (options.onSuccess) {
        options.onSuccess(responseData);
      }
      
      return responseData;
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
    delete: remove
  };
}