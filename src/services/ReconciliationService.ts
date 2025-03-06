import { api } from './api';
import { Transaction } from '../types/models';

interface ReconciliationItem {
  id: string;
  accountId: string;
  date: string;
  description: string;
  amount: number;
  status: 'pending' | 'matched' | 'unmatched';
  matchedTransactionId?: string;
}

export class ReconciliationService {
  static async getUnreconciledTransactions(accountId: string): Promise<Transaction[]> {
    const response = await api.get<Transaction[]>(`/reconciliation/${accountId}/unreconciled`);
    return response;
  }

  static async matchTransactions(
    accountId: string,
    matches: { transactionId: string; reconciliationItemId: string }[]
  ): Promise<void> {
    await api.post(`/reconciliation/${accountId}/match`, { matches });
  }

  static async unmatchTransaction(transactionId: string): Promise<void> {
    await api.post(`/reconciliation/unmatch/${transactionId}`);
  }

  static async importReconciliationData(
    accountId: string,
    file: File
  ): Promise<ReconciliationItem[]> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post<ReconciliationItem[]>(
      `/reconciliation/${accountId}/import`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response;
  }

  static async getReconciliationSummary(accountId: string): Promise<{
    totalItems: number;
    matchedItems: number;
    unmatchedItems: number;
    totalDifference: number;
  }> {
    const response = await api.get(`/reconciliation/${accountId}/summary`);
    return response;
  }
} 