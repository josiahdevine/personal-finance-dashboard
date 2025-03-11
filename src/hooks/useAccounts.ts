import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountRepository } from '../repositories/AccountRepository';
import logger from '../utils/logger';
import { plaidService } from '../services/plaidService';

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
  
  const openEditModal = (account: any) => {
    // In a real app, this would open a modal to edit the account
    console.log(`Edit account: ${account.id}`);
  };
  
  const openAddModal = () => {
    // In a real app, this would open a modal to add a new account
    console.log('Add new account');
  };
  
  return {
    ...query,
    accounts: query.data || [],
    refreshAccounts,
    deleteAccount,
    openEditModal,
    openAddModal
  };
};

/**
 * Hook to fetch a single account
 */
export const useAccount = (id: string | null) => {
  return useQuery({
    queryKey: ['account', id],
    queryFn: async () => {
      if (!id) {
        throw new Error('Account ID is required');
      }
      
      try {
        // Get account from repository
        const account = await accountRepository.findById(id);
        
        if (!account) {
          throw new Error(`Account with ID ${id} not found`);
        }
        
        return account;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error fetching account');
        logger.error('useAccount', `Failed to fetch account ${id}`, err);
        throw err;
      }
    },
    enabled: !!id,
    meta: {
      errorMessage: 'Failed to load account details'
    }
  });
};

/**
 * Hook to update account settings
 */
export const useUpdateAccountSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      settings 
    }: { 
      id: string; 
      settings: {
        is_hidden?: boolean;
        name?: string;
      }
    }) => {
      try {
        // Update account settings in repository
        const updatedAccount = await accountRepository.updateSettings(
          id,
          'current-user', // This would typically be the actual user ID from auth context
          settings
        );
        
        if (!updatedAccount) {
          throw new Error(`Failed to update account with ID ${id}`);
        }
        
        return updatedAccount;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error updating account settings');
        logger.error('useUpdateAccountSettings', `Failed to update account ${id}`, err);
        throw err;
      }
    },
    onSuccess: (updatedAccount) => {
      // Update the individual account cache
      queryClient.setQueryData(
        ['account', updatedAccount.id],
        updatedAccount
      );
      
      // Invalidate accounts list to refetch it
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
    meta: {
      showSuccessToast: true,
      successMessage: 'Account settings updated successfully',
    },
  });
};

/**
 * Hook to fetch account balance history
 */
export const useAccountBalanceHistory = (
  accountIds: string[],
  startDate?: string,
  endDate?: string
) => {
  // Set default date range if not provided (last 30 days)
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);
  
  const start = startDate || thirtyDaysAgo.toISOString().split('T')[0];
  const end = endDate || today.toISOString().split('T')[0];
  
  return useQuery({
    queryKey: ['accountBalanceHistory', accountIds, start, end],
    queryFn: async () => {
      try {
        if (!accountIds.length) {
          return { balance_history: [], start_date: start, end_date: end };
        }
        
        // Get balance history from repository
        const data = await accountRepository.getBalanceHistory(accountIds, start, end);
        
        return {
          balance_history: data,
          start_date: start,
          end_date: end
        };
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error fetching balance history');
        logger.error('useAccountBalanceHistory', 'Failed to fetch balance history', err);
        throw err;
      }
    },
    enabled: accountIds.length > 0 && !!start && !!end,
    staleTime: 5 * 60 * 1000, // 5 minutes
    meta: {
      errorMessage: 'Failed to load balance history'
    }
  });
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