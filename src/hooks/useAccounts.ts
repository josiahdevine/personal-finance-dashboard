import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { AccountAggregationService, AggregatedAccount } from '../services/AccountAggregationService';

export const useAccounts = () => {
  const [accounts, setAccounts] = useState<AggregatedAccount[]>([]);
  const { user } = useAuth();
  const accountService = AccountAggregationService.getInstance();

  const refreshAccounts = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await accountService.getAllAccounts(user.id);
      setAccounts(data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  }, [user, accountService]);

  const handleAccountClick = useCallback((account: AggregatedAccount) => {
    // Handle account click - can be expanded later
    console.log('Account clicked:', account);
  }, []);

  return {
    accounts,
    refreshAccounts,
    handleAccountClick,
  };
}; 