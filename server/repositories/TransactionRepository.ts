import { sql } from '@vercel/postgres';
import { ApiError } from '../utils/ApiError';

interface Transaction {
  id: string;
  userId: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  accountId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface GetTransactionsParams {
  userId: string;
  startDate: string;
  endDate: string;
  category?: string;
  accountId?: string;
  limit: number;
  offset: number;
}

class TransactionRepository {
  /**
   * Find transactions by user ID with filters
   */
  async findByUserIdWithFilters(params: GetTransactionsParams) {
    const {
      userId,
      startDate,
      endDate,
      category,
      accountId,
      limit,
      offset,
    } = params;

    // Build the base query
    let query = sql`
      SELECT *
      FROM transactions
      WHERE user_id = ${userId}
        AND date >= ${startDate}
        AND date <= ${endDate}
    `;

    // Add optional filters
    if (category) {
      query = sql`${query} AND category = ${category}`;
    }

    if (accountId) {
      query = sql`${query} AND account_id = ${accountId}`;
    }

    // Get total count
    const countQuery = sql`
      SELECT COUNT(*) as total
      FROM (${query}) as filtered_transactions
    `;

    // Add pagination
    query = sql`
      ${query}
      ORDER BY date DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    try {
      const [transactions, [{ total }]] = await Promise.all([
        sql.query<Transaction>(query),
        sql.query<{ total: number }>(countQuery),
      ]);

      return {
        transactions: transactions.rows,
        total: Number(total),
      };
    } catch (error) {
      throw new ApiError(500, 'Database error while fetching transactions');
    }
  }

  /**
   * Find transaction by ID
   */
  async findById(id: string): Promise<Transaction | null> {
    try {
      const result = await sql.query<Transaction>`
        SELECT *
        FROM transactions
        WHERE id = ${id}
      `;

      return result.rows[0] || null;
    } catch (error) {
      throw new ApiError(500, 'Database error while fetching transaction');
    }
  }

  /**
   * Update transaction
   */
  async update(id: string, data: Partial<Transaction>): Promise<Transaction> {
    const updates = Object.entries(data)
      .map(([key, value]) => sql`${sql.identifier([key])} = ${value}`)
      .join(', ');

    try {
      const result = await sql.query<Transaction>`
        UPDATE transactions
        SET ${sql.raw(updates)}, updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;

      if (!result.rows[0]) {
        throw new ApiError(404, 'Transaction not found');
      }

      return result.rows[0];
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Database error while updating transaction');
    }
  }
}

export const transactionRepository = new TransactionRepository(); 