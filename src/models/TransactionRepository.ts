import { BaseRepository } from './BaseRepository';
import { Transaction } from './types';
import { query } from '../db';
import { validateTransaction } from '../utils/validation';

export class TransactionRepository extends BaseRepository<Transaction> {
  constructor() {
    super('transactions');
  }

  async findByUserIdAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Transaction[]> {
    const results = await query<Transaction>(
      `
      SELECT * FROM transactions
      WHERE user_id = $1
        AND date >= $2
        AND date <= $3
      ORDER BY date DESC
      `,
      [userId, startDate, endDate]
    );

    return results;
  }

  async findByCategory(
    userId: string,
    category: string
  ): Promise<Transaction[]> {
    const results = await query<Transaction>(
      `
      SELECT * FROM transactions
      WHERE user_id = $1
        AND category = $2
      ORDER BY date DESC
      `,
      [userId, category]
    );

    return results;
  }

  async getMonthlySpending(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{ category: string; total: number }[]> {
    const results = await query<{ category: string; total: number }>(
      `
      SELECT category, SUM(amount) as total
      FROM transactions
      WHERE user_id = $1
        AND date >= $2
        AND date <= $3
        AND amount < 0
      GROUP BY category
      ORDER BY total DESC
      `,
      [userId, startDate, endDate]
    );

    return results;
  }

  async create(data: Partial<Transaction>): Promise<Transaction> {
    const validated = validateTransaction(data);
    return super.create(validated);
  }

  async update(id: string, data: Partial<Transaction>): Promise<Transaction> {
    const existingTransaction = await this.findById(id);
    if (!existingTransaction) {
      throw new Error(`Transaction with id ${id} not found`);
    }
    const validated = validateTransaction({ ...existingTransaction, ...data });
    const result = await super.update(id, validated);
    if (!result) {
      throw new Error(`Failed to update transaction with id ${id}`);
    }
    return result;
  }
} 