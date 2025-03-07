import api from './api';
import { Transaction, TransactionFilters } from '../types/models';
import { PaginatedResponse, QueryParams } from '../types/api';

export class TransactionService {
  static async getTransactions(
    filters?: TransactionFilters,
    pagination?: QueryParams
  ): Promise<PaginatedResponse<Transaction>> {
    try {
      const response = await api.get<PaginatedResponse<Transaction>>('/api/transactions', {
        params: { ...filters, ...pagination }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  static async getTransaction(id: string): Promise<Transaction> {
    try {
      const response = await api.get<Transaction>(`/api/transactions/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching transaction ${id}:`, error);
      throw error;
    }
  }

  static async updateTransaction(id: string, data: Partial<Transaction>): Promise<Transaction> {
    try {
      const response = await api.put<Transaction>(`/api/transactions/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating transaction ${id}:`, error);
      throw error;
    }
  }

  static async deleteTransaction(id: string): Promise<void> {
    await api.delete(`/transactions/${id}`);
  }

  static async categorizeTransactions(
    transactionIds: string[],
    category: string
  ): Promise<void> {
    try {
      await api.post('/api/transactions/categorize', {
        transactionIds,
        category
      });
    } catch (error) {
      console.error('Error categorizing transactions:', error);
      throw error;
    }
  }

  static async getTransactionStats(
    startDate: string,
    endDate: string
  ): Promise<{ totalIncome: number; totalExpenses: number; categoryBreakdown: Record<string, number> }> {
    try {
      const response = await api.get('/api/transactions/stats', {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching transaction stats:', error);
      throw error;
    }
  }

  static async exportTransactions(
    format: 'csv' | 'pdf',
    filters?: TransactionFilters
  ): Promise<Blob> {
    try {
      const response = await api.get('/api/transactions/export', {
        params: { format, ...filters },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting transactions:', error);
      throw error;
    }
  }
} 