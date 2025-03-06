import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { PlaidService } from '../services/PlaidService';
import { PlaidAccount, Transaction } from '../types/models';

interface PlaidContextType {
  accounts: PlaidAccount[];
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  refreshAccounts: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
  handleAccountClick: (account: PlaidAccount) => void;
}

const PlaidContext = createContext<PlaidContextType | undefined>(undefined);

export const PlaidProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<PlaidAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plaidService = new PlaidService();

  const refreshAccounts = useCallback(async () => {
    try {
      setLoading(true);
      const updatedAccounts = await plaidService.getAccounts();
      setAccounts(updatedAccounts);
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to refresh accounts');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const updatedTransactions = await plaidService.getTransactions();
      setTransactions(updatedTransactions);
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to refresh transactions');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAccountClick = useCallback((account: PlaidAccount) => {
    // Handle account click - can be used for navigation or showing details
    console.log('Account clicked:', account);
  }, []);

  // Initial data load
  useEffect(() => {
    refreshAccounts();
    refreshTransactions();
  }, [refreshAccounts, refreshTransactions]);

  const value = {
    accounts,
    transactions,
    loading,
    error,
    refreshAccounts,
    refreshTransactions,
    handleAccountClick,
  };

  return <PlaidContext.Provider value={value}>{children}</PlaidContext.Provider>;
};

export const usePlaid = () => {
  const context = useContext(PlaidContext);
  if (context === undefined) {
    throw new Error('usePlaid must be used within a PlaidProvider');
  }
  return context;
}; 