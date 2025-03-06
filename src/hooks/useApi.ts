import { useState, useCallback } from 'react';
import { ApiError, ApiResponse } from '../services/api';

interface UseApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  isLoading: boolean;
  execute: (...args: any[]) => Promise<void>;
  reset: () => void;
}

export function useApi<T>(
  apiFunction: (...args: any[]) => Promise<ApiResponse<T>>
): UseApiResponse<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  const execute = useCallback(async (...args: any[]) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiFunction(...args);
      setData(response.data);
    } catch (err) {
      setError(err as ApiError);
      throw err; // Re-throw to be caught by ErrorBoundary if needed
    } finally {
      setIsLoading(false);
    }
  }, [apiFunction]);

  return {
    data,
    error,
    isLoading,
    execute,
    reset
  };
} 