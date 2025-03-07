import { useCallback } from 'react';
import { PlaidAccount, Transaction } from '../types/models';

// Mock implementation of the useWebSocket hook
export function useWebSocket() {
  const handleAccountUpdate = useCallback((account: PlaidAccount) => {
    console.log('Account update:', account);
  }, []);

  const handleTransactionUpdate = useCallback((transaction: Transaction) => {
    console.log('Transaction update:', transaction);
  }, []);

  const handleError = useCallback((error: Error) => {
    console.error('WebSocket error:', error);
  }, []);

  return {
    handleAccountUpdate,
    handleTransactionUpdate,
    handleError
  };
} 