import { BaseRepository, Entity } from '../models/BaseRepository';
import { db } from '../config/database';
import logger from '../utils/logger';

export interface Transaction extends Entity {
  user_id: string;
  account_id: string;
  plaid_transaction_id: string;
  plaid_item_id: string;
  amount: number;
  date: string;
  name: string;
  merchant_name: string | null;
  payment_channel: string;
  pending: boolean;
  category: string | null;
  category_id: string | null;
  location: any | null;
}

export class TransactionRepository extends BaseRepository<Transaction> {
  constructor() {
    super('transactions');
  }
  
  /**
   * Find transactions for a user with filtering options
   */
  async findByUserId(
    userId: string,
    options: {
      startDate?: string;
      endDate?: string;
      accountIds?: string[];
      categories?: string[];
      searchTerm?: string;
      limit?: number;
      offset?: number;
      sortBy?: string;
      sortDirection?: 'ASC' | 'DESC';
    } = {}
  ): Promise<{
    transactions: Transaction[];
    total: number;
  }> {
    try {
      const {
        startDate,
        endDate,
        accountIds,
        categories,
        searchTerm,
        limit = 50,
        offset = 0,
        sortBy = 'date',
        sortDirection = 'DESC'
      } = options;
      
      // Build base queries
      const baseQuery = `
        FROM transactions t
        JOIN plaid_accounts a ON t.account_id = a.id
        WHERE t.user_id = $1 AND t.deleted_at IS NULL
      `;
      
      // Build where conditions
      const whereClauses: string[] = [];
      const values: any[] = [userId];
      let paramCount = 2;
      
      if (startDate) {
        whereClauses.push(`t.date >= $${paramCount}`);
        values.push(startDate);
        paramCount++;
      }
      
      if (endDate) {
        whereClauses.push(`t.date <= $${paramCount}`);
        values.push(endDate);
        paramCount++;
      }
      
      if (accountIds && accountIds.length > 0) {
        whereClauses.push(`t.account_id IN (${accountIds.map((_, i) => `$${paramCount + i}`).join(', ')})`);
        values.push(...accountIds);
        paramCount += accountIds.length;
      }
      
      if (categories && categories.length > 0) {
        whereClauses.push(`t.category IN (${categories.map((_, i) => `$${paramCount + i}`).join(', ')})`);
        values.push(...categories);
        paramCount += categories.length;
      }
      
      if (searchTerm) {
        whereClauses.push(`(
          t.name ILIKE $${paramCount} OR 
          t.merchant_name ILIKE $${paramCount} OR 
          t.category ILIKE $${paramCount}
        )`);
        values.push(`%${searchTerm}%`);
        paramCount++;
      }
      
      // Assemble the where clause
      const whereClause = whereClauses.length > 0
        ? ` AND ${whereClauses.join(' AND ')}`
        : '';
      
      // Build count query
      const countQuery = `
        SELECT COUNT(*) as total
        ${baseQuery}
        ${whereClause}
      `;
      
      // Build data query
      const dataQuery = `
        SELECT t.*, a.name as account_name, a.type as account_type
        ${baseQuery}
        ${whereClause}
        ORDER BY t.${sortBy} ${sortDirection}
        LIMIT ${limit} OFFSET ${offset}
      `;
      
      // Execute queries
      const [countResult, dataResult] = await Promise.all([
        db.query<{ total: string }>(countQuery, values),
        db.query<Transaction & { account_name: string; account_type: string }>(dataQuery, values)
      ]);
      
      return {
        transactions: dataResult.rows,
        total: parseInt(countResult.rows[0].total)
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown database error');
      logger.error('TransactionRepository', 'Error finding transactions by user ID:', err);
      throw err;
    }
  }
  
  /**
   * Get transaction summary by category
   */
  async getCategorySummary(
    userId: string,
    startDate: string,
    endDate: string,
    accountIds?: string[]
  ): Promise<any[]> {
    try {
      // Build base query
      let query = `
        SELECT 
          COALESCE(t.category, 'Uncategorized') as category,
          SUM(t.amount) as total_amount,
          COUNT(*) as transaction_count
        FROM transactions t
        WHERE t.user_id = $1 
          AND t.date BETWEEN $2 AND $3
          AND t.deleted_at IS NULL
      `;
      
      const params = [userId, startDate, endDate];
      const paramCount = 4;
      
      // Add account filter if provided
      if (accountIds && accountIds.length > 0) {
        query += ` AND t.account_id IN (${accountIds.map((_, i) => `$${paramCount + i}`).join(', ')})`;
        params.push(...accountIds);
      }
      
      // Complete query
      query += `
        GROUP BY category
        ORDER BY total_amount DESC
      `;
      
      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown database error');
      logger.error('TransactionRepository', 'Error getting category summary:', err);
      throw err;
    }
  }
  
  /**
   * Get monthly spending trends
   */
  async getMonthlyTrends(
    userId: string,
    startDate: string,
    endDate: string,
    accountIds?: string[]
  ): Promise<any[]> {
    try {
      // Build base query
      let query = `
        SELECT 
          DATE_TRUNC('month', t.date) as month,
          SUM(CASE WHEN t.amount < 0 THEN ABS(t.amount) ELSE 0 END) as expense,
          SUM(CASE WHEN t.amount > 0 THEN t.amount ELSE 0 END) as income
        FROM transactions t
        WHERE t.user_id = $1 
          AND t.date BETWEEN $2 AND $3
          AND t.deleted_at IS NULL
      `;
      
      const params = [userId, startDate, endDate];
      const paramCount = 4;
      
      // Add account filter if provided
      if (accountIds && accountIds.length > 0) {
        query += ` AND t.account_id IN (${accountIds.map((_, i) => `$${paramCount + i}`).join(', ')})`;
        params.push(...accountIds);
      }
      
      // Complete query
      query += `
        GROUP BY month
        ORDER BY month
      `;
      
      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown database error');
      logger.error('TransactionRepository', 'Error getting monthly trends:', err);
      throw err;
    }
  }
}

export const transactionRepository = new TransactionRepository(); 