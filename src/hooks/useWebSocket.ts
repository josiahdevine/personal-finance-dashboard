import { useEffect, useCallback } from 'react';
import { WebSocketService } from '../services/WebSocketService';
import { useAuth } from './useAuth';
import { PlaidAccount, Transaction } from '../types/models';

export function useWebSocket() {
  const { user } = useAuth();
  const wsService = new WebSocketService();

  const handleAccountUpdate = useCallback((account: PlaidAccount) => {
    // Handle account update event
    console.log('Account updated:', account);
  }, []);

  const handleTransactionUpdate = useCallback((transaction: Transaction) => {
    // Handle transaction update event
    console.log('Transaction updated:', transaction);
  }, []);

  const handleError = useCallback((error: Error) => {
    // Handle error event
    console.error('WebSocket error:', error);
  }, []);

  useEffect(() => {
    if (!user) return;

    wsService.connect();

    const unsubscribeAccount = wsService.subscribe('account_update', handleAccountUpdate);
    const unsubscribeTransaction = wsService.subscribe('transaction_update', handleTransactionUpdate);
    const unsubscribeError = wsService.subscribe('error', handleError);

    return () => {
      unsubscribeAccount();
      unsubscribeTransaction();
      unsubscribeError();
      wsService.disconnect();
    };
  }, [user, wsService, handleAccountUpdate, handleTransactionUpdate, handleError]);
} 