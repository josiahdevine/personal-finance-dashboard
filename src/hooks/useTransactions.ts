import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionRepository } from '../repositories/TransactionRepository';
import logger from '../utils/logger';
import { Transaction } from '../repositories/TransactionRepository';

/**
 * Hook to fetch transactions with pagination and filtering
 */
export const useTransactions = (
  filters: {
    startDate?: string;
    endDate?: string;
    accountIds?: string[];
    categories?: string[];
    searchTerm?: string;
  } = {},
  page = 1,
  limit = 25
) => {
  // Set default date range if not provided
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);
  
  const formattedFilters = {
    startDate: filters.startDate || thirtyDaysAgo.toISOString().split('T')[0],
    endDate: filters.endDate || today.toISOString().split('T')[0],
    accountIds: filters.accountIds,
    categories: filters.categories,
    searchTerm: filters.searchTerm,
  };
  
  // Calculate offset from page and limit
  const offset = (page - 1) * limit;
  
  return useQuery({
    queryKey: ['transactions', formattedFilters, page, limit],
    queryFn: async () => {
      try {
        // Get transactions with repository (from database)
        const result = await transactionRepository.findByUserId(
          'current-user', // This would typically be the actual user ID from auth context
          {
            startDate: formattedFilters.startDate,
            endDate: formattedFilters.endDate,
            accountIds: formattedFilters.accountIds,
            categories: formattedFilters.categories,
            searchTerm: formattedFilters.searchTerm,
            limit,
            offset,
            sortBy: 'date',
            sortDirection: 'DESC'
          }
        );
        
        return {
          data: result.transactions,
          total: result.total,
          page,
          limit,
          totalPages: Math.ceil(result.total / limit)
        };
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error fetching transactions');
        logger.error('useTransactions', 'Failed to fetch transactions', err);
        throw err;
      }
    },
    staleTime: 60 * 1000, // 1 minute
    placeholderData: (previousData) => previousData, // This replaces keepPreviousData in v4
    meta: {
      errorMessage: 'Failed to load transactions'
    }
  });
};

/**
 * Hook to fetch a single transaction
 */
export const useTransaction = (id: string | null) => {
  return useQuery({
    queryKey: ['transaction', id],
    queryFn: async () => {
      if (!id) {
        throw new Error('Transaction ID is required');
      }
      
      try {
        // Get transaction from repository
        const transaction = await transactionRepository.findById(id);
        
        if (!transaction) {
          throw new Error(`Transaction with ID ${id} not found`);
        }
        
        return transaction;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error fetching transaction');
        logger.error('useTransaction', `Failed to fetch transaction ${id}`, err);
        throw err;
      }
    },
    enabled: !!id,
    meta: {
      errorMessage: 'Failed to load transaction details'
    }
  });
};

/**
 * Hook to update a transaction
 */
export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Transaction> }) => {
      try {
        // Update transaction in repository
        const updatedTransaction = await transactionRepository.update(id, data);
        
        if (!updatedTransaction) {
          throw new Error(`Failed to update transaction with ID ${id}`);
        }
        
        return updatedTransaction;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error updating transaction');
        logger.error('useUpdateTransaction', `Failed to update transaction ${id}`, err);
        throw err;
      }
    },
    onSuccess: (updatedTransaction) => {
      // Update the individual transaction cache
      queryClient.setQueryData(
        ['transaction', updatedTransaction.id],
        updatedTransaction
      );
      
      // Invalidate transactions list to refetch it
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    meta: {
      showSuccessToast: true,
      successMessage: 'Transaction updated successfully',
    },
  });
};

/**
 * Hook to fetch transaction category summary
 */
export const useTransactionCategorySummary = (
  startDate?: string,
  endDate?: string,
  accountIds?: string[]
) => {
  // Set default date range if not provided
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);
  
  const start = startDate || thirtyDaysAgo.toISOString().split('T')[0];
  const end = endDate || today.toISOString().split('T')[0];
  
  return useQuery({
    queryKey: ['transactionCategorySummary', start, end, accountIds],
    queryFn: async () => {
      try {
        // Get category summary from repository
        const data = await transactionRepository.getCategorySummary(
          'current-user', // This would typically be the actual user ID from auth context
          start,
          end,
          accountIds
        );
        
        return data;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error fetching category summary');
        logger.error('useTransactionCategorySummary', 'Failed to load category summary', err);
        throw err;
      }
    },
    enabled: !!start && !!end,
    staleTime: 5 * 60 * 1000, // 5 minutes
    meta: {
      errorMessage: 'Failed to load category summary'
    }
  });
};

/**
 * Hook to fetch monthly spending trends
 */
export const useMonthlySpendingTrends = (
  startDate?: string,
  endDate?: string,
  accountIds?: string[]
) => {
  // Set default date range if not provided (last 6 months)
  const today = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(today.getMonth() - 6);
  
  const start = startDate || sixMonthsAgo.toISOString().split('T')[0];
  const end = endDate || today.toISOString().split('T')[0];
  
  return useQuery({
    queryKey: ['monthlySpendingTrends', start, end, accountIds],
    queryFn: async () => {
      try {
        // Get monthly trends from repository
        const data = await transactionRepository.getMonthlyTrends(
          'current-user', // This would typically be the actual user ID from auth context
          start,
          end,
          accountIds
        );
        
        return data;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error fetching spending trends');
        logger.error('useMonthlySpendingTrends', 'Failed to load spending trends', err);
        throw err;
      }
    },
    enabled: !!start && !!end,
    staleTime: 5 * 60 * 1000, // 5 minutes
    meta: {
      errorMessage: 'Failed to load spending trends'
    }
  });
}; 