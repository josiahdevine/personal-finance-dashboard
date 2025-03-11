import { BaseRepository, Entity } from '../models/BaseRepository';
import { db } from '../config/database';
import logger from '../utils/logger';

export interface Account extends Entity {
  user_id: string;
  plaid_item_id: string;
  plaid_account_id: string;
  name: string;
  official_name: string | null;
  type: string;
  subtype: string | null;
  balance: number;
  available_balance: number | null;
  limit_amount: number | null;
  currency_code: string;
  mask: string | null;
  is_hidden: boolean;
  is_deleted: boolean;
}

export class AccountRepository extends BaseRepository<Account> {
  constructor() {
    super('plaid_accounts');
  }
  
  /**
   * Find accounts for a user with optional filters
   */
  async findByUserId(
    userId: string,
    options: {
      includeHidden?: boolean;
      type?: string | string[];
      searchTerm?: string;
      institutionId?: string;
    } = {}
  ): Promise<Account[]> {
    try {
      const { includeHidden = false, type, searchTerm, institutionId } = options;
      
      // Build base query
      let query = `
        SELECT a.*, i.institution_name, i.institution_color, i.institution_logo
        FROM plaid_accounts a
        JOIN plaid_items i ON a.plaid_item_id = i.plaid_item_id
        WHERE a.user_id = $1
          AND a.is_deleted = false
      `;
      
      const params = [userId];
      let paramCount = 2;
      
      // Add hidden filter
      if (!includeHidden) {
        query += ` AND a.is_hidden = false`;
      }
      
      // Add type filter
      if (type) {
        if (Array.isArray(type)) {
          query += ` AND a.type IN (${type.map((_, i) => `$${paramCount + i}`).join(', ')})`;
          params.push(...type);
          paramCount += type.length;
        } else {
          query += ` AND a.type = $${paramCount}`;
          params.push(type);
          paramCount++;
        }
      }
      
      // Add search filter
      if (searchTerm) {
        query += ` AND (
          a.name ILIKE $${paramCount} OR
          a.official_name ILIKE $${paramCount}
        )`;
        params.push(`%${searchTerm}%`);
        paramCount++;
      }
      
      // Add institution filter
      if (institutionId) {
        query += ` AND i.plaid_institution_id = $${paramCount}`;
        params.push(institutionId);
        paramCount++;
      }
      
      // Complete query
      query += ` ORDER BY i.institution_name, a.name`;
      
      const result = await db.query<Account & {
        institution_name: string;
        institution_color: string;
        institution_logo: string;
      }>(query, params);
      return result.rows;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown database error');
      logger.error('AccountRepository', 'Error finding accounts by user ID:', err);
      throw err;
    }
  }
  
  /**
   * Get account balance history
   */
  async getBalanceHistory(
    accountIds: string[],
    startDate: string,
    endDate: string
  ): Promise<any[]> {
    try {
      if (!accountIds.length) {
        return [];
      }
      
      const query = `
        SELECT account_id, date, balance
        FROM account_balances
        WHERE account_id IN (${accountIds.map((_, i) => `$${i + 1}`).join(', ')})
          AND date BETWEEN $${accountIds.length + 1} AND $${accountIds.length + 2}
        ORDER BY date
      `;
      
      const result = await db.query(query, [...accountIds, startDate, endDate]);
      return result.rows;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown database error');
      logger.error('AccountRepository', 'Error getting account balance history:', err);
      throw err;
    }
  }
  
  /**
   * Update account settings
   */
  async updateSettings(
    accountId: string, 
    userId: string,
    settings: {
      is_hidden?: boolean;
      name?: string;
    }
  ): Promise<Account | null> {
    try {
      const updates: string[] = [];
      const values: any[] = [];
      let paramCount = 1;
      
      // Build update clauses
      if (settings.is_hidden !== undefined) {
        updates.push(`is_hidden = $${paramCount}`);
        values.push(settings.is_hidden);
        paramCount++;
      }
      
      if (settings.name) {
        updates.push(`name = $${paramCount}`);
        values.push(settings.name);
        paramCount++;
      }
      
      if (!updates.length) {
        throw new Error('No updates provided');
      }
      
      // Add timestamp
      updates.push(`updated_at = NOW()`);
      
      // Build query
      const query = `
        UPDATE plaid_accounts
        SET ${updates.join(', ')}
        WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
        RETURNING *
      `;
      
      values.push(accountId, userId);
      
      const result = await db.query<Account>(query, values);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0];
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown database error');
      logger.error('AccountRepository', 'Error updating account settings:', err);
      throw err;
    }
  }
}

export const accountRepository = new AccountRepository(); 