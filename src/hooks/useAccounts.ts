import { useState, useEffect, useCallback } from 'react';
import { Account } from '../types/models';

interface AccountFilters {
  type?: string;
  institution?: string;
  isActive?: boolean;
}

export const useAccounts = (initialFilters?: AccountFilters) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [filters, setFilters] = useState<AccountFilters>(initialFilters || {});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    try {
      setIsLoading(true);
      // Build query params from filters
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });

      // TODO: Replace with actual API call
      const response = await fetch(`/api/accounts?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch accounts');
      }
      const data = await response.json();
      setAccounts(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch accounts');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const addAccount = useCallback(async (account: Omit<Account, 'id'>) => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(account)
      });
      if (!response.ok) {
        throw new Error('Failed to add account');
      }
      const newAccount = await response.json();
      setAccounts(prev => [...prev, newAccount]);
      setError(null);
      return newAccount;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add account');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateAccount = useCallback(async (id: string, updates: Partial<Account>) => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      const response = await fetch(`/api/accounts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!response.ok) {
        throw new Error('Failed to update account');
      }
      const updatedAccount = await response.json();
      setAccounts(prev =>
        prev.map(account => (account.id === id ? { ...account, ...updatedAccount } : account))
      );
      setError(null);
      return updatedAccount;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update account');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteAccount = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      const response = await fetch(`/api/accounts/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to delete account');
      }
      setAccounts(prev => prev.filter(account => account.id !== id));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateFilters = useCallback((newFilters: Partial<AccountFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  return {
    accounts,
    filters,
    isLoading,
    error,
    updateFilters,
    addAccount,
    updateAccount,
    deleteAccount,
    refreshAccounts: fetchAccounts
  };
}; 