import { transactionRepository } from '../repositories/TransactionRepository';
import { ApiError } from '../utils/ApiError';

interface GetTransactionsParams {
  userId: string;
  startDate: string;
  endDate: string;
  category?: string;
  accountId?: string;
  limit: number;
  offset: number;
}

class TransactionService {
  /**
   * Get transactions for a user with filtering
   */
  async getTransactions(params: GetTransactionsParams) {
    const { transactions, total } = await transactionRepository.findByUserIdWithFilters(params);
    
    // Process transactions (e.g., format dates, calculate additional fields)
    const processedTransactions = transactions.map(transaction => ({
      ...transaction,
      formattedDate: new Date(transaction.date).toLocaleDateString(),
      humanReadableAmount: `$${Math.abs(transaction.amount).toFixed(2)}`,
      type: transaction.amount < 0 ? 'expense' : 'income',
    }));
    
    return {
      transactions: processedTransactions,
      total,
      limit: params.limit,
      offset: params.offset,
    };
  }
  
  /**
   * Get a specific transaction by ID
   */
  async getTransactionById(id: string, userId: string) {
    const transaction = await transactionRepository.findById(id);
    
    if (!transaction) {
      return null;
    }
    
    // Check if transaction belongs to user
    if (transaction.userId !== userId) {
      throw new ApiError(403, 'Forbidden');
    }
    
    // Process transaction
    return {
      ...transaction,
      formattedDate: new Date(transaction.date).toLocaleDateString(),
      humanReadableAmount: `$${Math.abs(transaction.amount).toFixed(2)}`,
      type: transaction.amount < 0 ? 'expense' : 'income',
    };
  }
  
  /**
   * Update transaction category
   */
  async updateTransactionCategory(id: string, category: string, userId: string) {
    // Check if transaction exists and belongs to user
    const transaction = await transactionRepository.findById(id);
    
    if (!transaction) {
      throw new ApiError(404, 'Transaction not found');
    }
    
    if (transaction.userId !== userId) {
      throw new ApiError(403, 'Forbidden');
    }
    
    // Update category
    const updatedTransaction = await transactionRepository.update(id, { category });
    
    return updatedTransaction;
  }
}

export const transactionService = new TransactionService(); 