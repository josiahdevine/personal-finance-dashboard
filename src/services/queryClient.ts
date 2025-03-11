import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import logger from '../utils/logger';

// Toast notification function (can be replaced with actual implementation)
const toast = {
  error: (message: string) => {
    console.error(`TOAST: ${message}`);
    // Here would be the actual toast implementation
  },
  success: (message: string) => {
    console.log(`TOAST: ${message}`);
    // Here would be the actual toast implementation
  }
};

// Configure query client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 404 errors
        if (error?.status === 404) return false;
        
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    },
  },
  queryCache: new QueryCache({
    onError: (error: any, query) => {
      // Only show error toasts for non-silent queries
      if (query.meta?.silent !== true) {
        const err = error instanceof Error ? error : new Error('Unknown query error');
        logger.error('QueryClient', 'Query error:', err);
        
        // Show toast with error message
        const errorMessage = query.meta?.errorMessage || 'An error occurred while fetching data';
        toast.error(String(errorMessage));
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error: any, _variables, _context, mutation) => {
      // Only show error toasts for non-silent mutations
      if (mutation.meta?.silent !== true) {
        const err = error instanceof Error ? error : new Error('Unknown mutation error');
        logger.error('QueryClient', 'Mutation error:', err);
        
        // Show toast with error message
        const errorMessage = mutation.meta?.errorMessage || 'An error occurred while updating data';
        toast.error(String(errorMessage));
      }
    },
    onSuccess: (_data, _variables, _context, mutation) => {
      // Show success toast for mutations with showSuccessToast flag
      if (mutation.meta?.showSuccessToast) {
        const successMessage = mutation.meta?.successMessage || 'Successfully updated';
        toast.success(String(successMessage));
      }
    },
  }),
});

/**
 * Reset the query cache (useful for logout)
 */
export const resetQueryCache = () => {
  queryClient.clear();
  logger.info('QueryClient', 'Query cache has been reset');
};

/**
 * Invalidate queries by key
 */
export const invalidateQueries = (queryKey: string | string[]) => {
  queryClient.invalidateQueries({ queryKey: Array.isArray(queryKey) ? queryKey : [queryKey] });
  logger.debug('QueryClient', `Invalidated queries with key: ${Array.isArray(queryKey) ? queryKey.join('.') : queryKey}`);
};

/**
 * Prefetch a query
 */
export const prefetchQuery = async (
  queryKey: string | string[],
  queryFn: () => Promise<any>,
  options?: any
) => {
  try {
    await queryClient.prefetchQuery({
      queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
      queryFn,
      ...options
    });
    logger.debug('QueryClient', `Prefetched query with key: ${Array.isArray(queryKey) ? queryKey.join('.') : queryKey}`);
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown prefetch error');
    logger.error('QueryClient', 'Prefetch error:', err);
  }
};

export default queryClient; 