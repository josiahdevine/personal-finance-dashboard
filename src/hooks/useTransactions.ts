import { useState, useEffect, useCallback } from 'react';
import { Transaction } from '../types/models';

interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  category?: string;
  type?: 'income' | 'expense';
  minAmount?: number;
  maxAmount?: number;
  searchTerm?: string;
}

export const useTransactions = (initialFilters?: TransactionFilters) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filters, setFilters] = useState<TransactionFilters>(initialFilters || {});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
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
      const response = await fetch(`/api/transactions?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      const data = await response.json();
      setTransactions(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id'>) => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction)
      });
      if (!response.ok) {
        throw new Error('Failed to add transaction');
      }
      const newTransaction = await response.json();
      setTransactions(prev => [...prev, newTransaction]);
      setError(null);
      return newTransaction;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add transaction');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTransaction = useCallback(async (id: string, updates: Partial<Transaction>) => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!response.ok) {
        throw new Error('Failed to update transaction');
      }
      const updatedTransaction = await response.json();
      setTransactions(prev =>
        prev.map(tx => (tx.id === id ? { ...tx, ...updatedTransaction } : tx))
      );
      setError(null);
      return updatedTransaction;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update transaction');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteTransaction = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to delete transaction');
      }
      setTransactions(prev => prev.filter(tx => tx.id !== id));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete transaction');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateFilters = useCallback((newFilters: Partial<TransactionFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    filters,
    isLoading,
    error,
    updateFilters,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refreshTransactions: fetchTransactions
  };
}; 