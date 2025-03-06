import { useState, useCallback } from 'react';

interface AsyncActionOptions<T> {
  onSuccess?: (result: T) => void;
  onError?: (error: Error) => void;
  resetOnSuccess?: boolean;
}

export function useAsyncAction<T>(
  asyncFunction: (...args: any[]) => Promise<T>,
  options: AsyncActionOptions<T> = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  
  const execute = useCallback(
    async (...args: any[]) => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await asyncFunction(...args);
        setData(result);
        
        if (options.onSuccess) {
          options.onSuccess(result);
        }
        
        if (options.resetOnSuccess) {
          setTimeout(() => {
            setData(null);
            setLoading(false);
          }, 2000);
        } else {
          setLoading(false);
        }
        
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        setLoading(false);
        
        if (options.onError) {
          options.onError(error);
        }
        
        throw error;
      }
    },
    [asyncFunction, options]
  );
  
  return {
    execute,
    data,
    error,
    loading,
    reset: () => {
      setData(null);
      setError(null);
      setLoading(false);
    }
  };
} 