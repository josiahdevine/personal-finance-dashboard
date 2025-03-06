import api from './api';
import { Transaction } from '../types/models';

interface ReconciliationSummary {
  totalItems: number;
  matchedItems: number;
  unmatchedItems: number;
  totalDifference: number;
}

interface ReconciliationItem {
  id: string;
  type: string;
  source: string;
  amount: number;
  date: string;
  description: string;
  status: 'matched' | 'unmatched';
  matchedItemId?: string;
  difference?: number;
}

export const uploadReconciliationFile = async (file: File): Promise<{ jobId: string }> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post<{ jobId: string }>('/reconciliation/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return data;
  } catch (error) {
    console.error('Error uploading reconciliation file:', error);
    throw error;
  }
};

export const getReconciliationSummary = async (jobId: string): Promise<ReconciliationSummary> => {
  try {
    const { data } = await api.get<ReconciliationSummary>(`/reconciliation/${jobId}/summary`);
    return data;
  } catch (error) {
    console.error('Error fetching reconciliation summary:', error);
    throw error;
  }
};

export const getReconciliationItems = async (
  jobId: string,
  status?: 'matched' | 'unmatched'
): Promise<ReconciliationItem[]> => {
  try {
    const { data } = await api.get<ReconciliationItem[]>(`/reconciliation/${jobId}/items`, {
      params: { status }
    });
    return data;
  } catch (error) {
    console.error('Error fetching reconciliation items:', error);
    throw error;
  }
};

export class ReconciliationService {
  static async getUnreconciledTransactions(accountId: string): Promise<Transaction[]> {
    const { data } = await api.get<Transaction[]>(`/reconciliation/${accountId}/unreconciled`);
    return data;
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
    
    const { data } = await api.post<ReconciliationItem[]>(
      `/reconciliation/${accountId}/import`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data;
  }
} 