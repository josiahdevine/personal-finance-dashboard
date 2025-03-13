import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountRepository } from '../repositories/AccountRepository';
import logger from '../utils/logger';
import { plaidService } from '../lower-components';

/**
 * Hook to fetch all accounts with data and refresh function
 */
export const useAccounts = (options: {
  includeHidden?: boolean;
  type?: string | string[];
  searchTerm?: string;
  institutionId?: string;
} = {}) => {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ['accounts', options],
    queryFn: async () => {
      try {
        // Get accounts from repository
        const accounts = await accountRepository.findByUserId(
          'current-user', // This would typically be the actual user ID from auth context
          options
        );
        
        return accounts;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error fetching accounts');
        logger.error('useAccounts', 'Failed to fetch accounts', err);
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    meta: {
      errorMessage: 'Failed to load accounts'
    }
  });
  
  const refreshAccounts = async () => {
    try {
      // Force a refresh of accounts data
      await queryClient.invalidateQueries({ queryKey: ['accounts'] });
      return { success: true };
    } catch (error) {
      logger.error('refreshAccounts', 'Failed to refresh accounts', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  };
  
  // Add functions needed for AccountSettings
  const deleteAccount = async (id: string) => {
    try {
      await accountRepository.delete(id);
      await refreshAccounts();
      return { success: true };
    } catch (error) {
      logger.error('deleteAccount', `Failed to delete account ${id}`, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  };
  
  const updateAccount = async (id: string, data: Partial<{ name: string; hidden: boolean; }>) => {
    try {
      await accountRepository.update(id, data);
      await refreshAccounts();
      return { success: true };
    } catch (error) {
      logger.error('updateAccount', `Failed to update account ${id}`, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  };

  // Dummy functions for modal handling
  const openEditModal = (accountId: string) => {
    console.log('Opening edit modal for account:', accountId);
  };

  const openAddModal = () => {
    console.log('Opening add account modal');
  };
  
  return {
    ...query,
    accounts: query.data || [], // Ensure accounts is always an array
    refreshAccounts,
    deleteAccount,
    updateAccount,
    openEditModal,
    openAddModal
  };
};

/**
 * Hook to sync accounts with Plaid
 */
export const useSyncAccounts = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      try {
        // Sync transactions using Plaid service
        const result = await plaidService.syncTransactions();
        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error syncing accounts');
        logger.error('useSyncAccounts', 'Failed to sync accounts with Plaid', err);
        throw err;
      }
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accountBalanceHistory'] });
    },
    meta: {
      showSuccessToast: true,
      successMessage: 'Accounts successfully synchronized',
    },
  });
}; 