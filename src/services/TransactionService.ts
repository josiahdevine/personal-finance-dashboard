import { api } from './api';
import { Transaction, TransactionFilters } from '../types/models';
import { PaginatedResponse, QueryParams } from '../types/api';

export class TransactionService {
  static async getTransactions(
    filters: TransactionFilters = {},
    queryParams: QueryParams = {}
  ): Promise<PaginatedResponse<Transaction>> {
    const response = await api.get<PaginatedResponse<Transaction>>('/transactions', {
      params: {
        ...filters,
        ...queryParams
      }
    });
    return response;
  }

  static async getTransaction(id: string): Promise<Transaction> {
    const response = await api.get<Transaction>(`/transactions/${id}`);
    return response;
  }

  static async updateTransaction(
    id: string,
    updates: Partial<Transaction>
  ): Promise<Transaction> {
    const response = await api.patch<Transaction>(`/transactions/${id}`, updates);
    return response;
  }

  static async deleteTransaction(id: string): Promise<void> {
    await api.delete(`/transactions/${id}`);
  }

  static async categorizeTransactions(
    transactionIds: string[],
    category: string[]
  ): Promise<void> {
    await api.post('/transactions/categorize', {
      transactionIds,
      category
    });
  }

  static async getTransactionStats(
    startDate: string,
    endDate: string
  ): Promise<{
    totalIncome: number;
    totalExpenses: number;
    categoryBreakdown: Record<string, number>;
  }> {
    const response = await api.get('/transactions/stats', {
      params: { startDate, endDate }
    });
    return response;
  }

  static async exportTransactions(
    format: 'csv' | 'pdf',
    filters: TransactionFilters = {}
  ): Promise<Blob> {
    const response = await api.get(`/transactions/export/${format}`, {
      params: filters,
      responseType: 'blob'
    });
    return response;
  }
} 