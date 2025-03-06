import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';

interface Transaction {
  id: string;
  accountId: string;
  amount: number;
  currency: string;
  date: string;
  description: string;
  category: string;
  merchant?: string;
  type: 'credit' | 'debit';
  status: 'pending' | 'posted';
}

interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  category?: string;
  accountId?: string;
  minAmount?: number;
  maxAmount?: number;
}

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchTransactions = useCallback(async (filters?: TransactionFilters) => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) queryParams.append(key, value.toString());
        });
      }

      const response = await fetch(`/api/transactions?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      const data = await response.json();
      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const categorizeTransaction = useCallback(async (transactionId: string, category: string) => {
    if (!user) return;
    try {
      const response = await fetch(`/api/transactions/${transactionId}/categorize`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category }),
      });

      if (!response.ok) {
        throw new Error('Failed to categorize transaction');
      }

      setTransactions(prev =>
        prev.map(t =>
          t.id === transactionId ? { ...t, category } : t
        )
      );
    } catch (err) {
      console.error('Error categorizing transaction:', err);
      throw err;
    }
  }, [user]);

  return {
    transactions,
    loading,
    error,
    fetchTransactions,
    categorizeTransaction,
  };
}; 