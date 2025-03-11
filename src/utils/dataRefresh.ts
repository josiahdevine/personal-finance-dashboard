import { useEffect, useRef, useCallback, useState } from 'react';
import type { ApiResponse, BaseComponentProps } from '../types';
import React, { JSX } from 'react';

interface RefreshConfig {
  interval?: number;
  enabled?: boolean;
  retryOnError?: boolean;
  maxRetries?: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface OptimisticUpdate<T> {
  id: string;
  data: Partial<T>;
  timestamp: number;
  status: 'pending' | 'success' | 'error';
  error?: Error;
}

export function useAutoRefresh<T>(
  fetchFn: () => Promise<ApiResponse<T>>,
  config: RefreshConfig = {}
) {
  const {
    interval = 30000,
    enabled = true,
    retryOnError = true,
    maxRetries = 3,
    onSuccess,
    onError
  } = config;

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const retryCount = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const fetch = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetchFn();
      if (response.data !== undefined) {
        setData(response.data);
      }
      setError(null);
      retryCount.current = 0;
      onSuccess?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(error);

      if (retryOnError && retryCount.current < maxRetries) {
        retryCount.current += 1;
        timeoutRef.current = setTimeout(fetch, interval);
      }
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn, interval, maxRetries, onError, onSuccess, retryOnError]);

  useEffect(() => {
    if (enabled) {
      fetch();
      timeoutRef.current = setInterval(fetch, interval);
    }

    return () => {
      if (timeoutRef.current) {
        clearInterval(timeoutRef.current);
      }
    };
  }, [enabled, fetch, interval]);

  return { data, error, isLoading, refetch: fetch };
}

export function useOptimisticUpdates<T extends { id: string }>(
  initialData: T[],
  updateFn: (id: string, data: Partial<T>) => Promise<ApiResponse<T>>
) {
  const [data, setData] = useState<T[]>(initialData);
  const [updates, setUpdates] = useState<OptimisticUpdate<T>[]>([]);

  const update = useCallback(
    async (id: string, updateData: Partial<T>) => {
      const timestamp = Date.now();
      
      setUpdates(prev => [
        ...prev,
        { id, data: updateData, timestamp, status: 'pending' }
      ]);

      setData(prev =>
        prev.map(item =>
          item.id === id ? { ...item, ...updateData } : item
        )
      );

      try {
        const response = await updateFn(id, updateData);
        
        setUpdates(prev =>
          prev.map(update =>
            update.id === id && update.timestamp === timestamp
              ? { ...update, status: 'success' }
              : update
          )
        );

        setData(prev =>
          prev.map(item =>
            item.id === id ? (response.data as T) : item
          )
        );
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        
        setUpdates(prev =>
          prev.map(update =>
            update.id === id && update.timestamp === timestamp
              ? { ...update, status: 'error', error }
              : update
          )
        );

        setData(prev =>
          prev.map(item =>
            item.id === id
              ? { ...item, ...updateData, error }
              : item
          )
        );

        throw error;
      }
    },
    [updateFn]
  );

  return { data, updates, update };
}

interface RefreshableProps extends BaseComponentProps {
  onRefresh?: () => Promise<void>;
  refreshInterval?: number;
  children: React.ReactNode;
}

export const RefreshableContainer: React.FC<RefreshableProps> = ({
  className,
  onRefresh,
  refreshInterval,
  children
}): JSX.Element => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleRefresh = useCallback(async () => {
    if (!onRefresh || isRefreshing) return;

    try {
      setIsRefreshing(true);
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, onRefresh]);

  useEffect(() => {
    if (refreshInterval && onRefresh) {
      timeoutRef.current = setInterval(handleRefresh, refreshInterval);
    }

    return () => {
      if (timeoutRef.current) {
        clearInterval(timeoutRef.current);
      }
    };
  }, [refreshInterval, onRefresh, handleRefresh]);

  return React.createElement('div', { className },
    React.createElement('div', { className: 'flex justify-end mb-4' },
      React.createElement('button', {
        onClick: handleRefresh,
        disabled: isRefreshing,
        className: `inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
          isRefreshing ? 'opacity-75 cursor-not-allowed' : ''
        }`
      },
        React.createElement('svg', {
          className: `w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`,
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: '2'
        },
          React.createElement('path', {
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            d: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
          })
        ),
        isRefreshing ? 'Refreshing...' : 'Refresh'
      )
    ),
    children
  );
};
