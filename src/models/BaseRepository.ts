import { db } from '../config/database';
import logger from '../utils/logger';

export interface Entity {
  id: string;
  created_at?: Date | string;
  updated_at?: Date | string;
  deleted_at?: Date | string | null;
}

export class BaseRepository<T extends Entity> {
  protected tableName: string;
  protected softDelete: boolean;
  
  constructor(tableName: string, softDelete = true) {
    this.tableName = tableName;
    this.softDelete = softDelete;
  }
  
  /**
   * Find entity by ID
   */
  async findById(id: string, includeDeleted = false): Promise<T | null> {
    try {
      let query = `SELECT * FROM ${this.tableName} WHERE id = $1`;
      
      if (this.softDelete && !includeDeleted) {
        query += ` AND deleted_at IS NULL`;
      }
      
      const result = await db.query<T>(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0];
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown database error');
      logger.error('Repository', `Error in ${this.tableName}.findById:`, err);
      throw err;
    }
  }
  
  /**
   * Find all entities
   */
  async findAll(options: {
    where?: Record<string, any>;
    orderBy?: string;
    orderDirection?: 'ASC' | 'DESC';
    limit?: number;
    offset?: number;
    includeDeleted?: boolean;
  } = {}): Promise<T[]> {
    try {
      const {
        where = {},
        orderBy = 'created_at',
        orderDirection = 'DESC',
        limit,
        offset,
        includeDeleted = false
      } = options;
      
      const whereClauses: string[] = [];
      const values: any[] = [];
      let paramCount = 1;
      
      // Add soft delete condition
      if (this.softDelete && !includeDeleted) {
        whereClauses.push(`deleted_at IS NULL`);
      }
      
      // Add where conditions
      Object.entries(where).forEach(([key, value]) => {
        // Handle null values
        if (value === null) {
          whereClauses.push(`${key} IS NULL`);
        } else {
          whereClauses.push(`${key} = $${paramCount}`);
          values.push(value);
          paramCount++;
        }
      });
      
      // Build query
      let query = `SELECT * FROM ${this.tableName}`;
      
      if (whereClauses.length > 0) {
        query += ` WHERE ${whereClauses.join(' AND ')}`;
      }
      
      query += ` ORDER BY ${orderBy} ${orderDirection}`;
      
      if (limit) {
        query += ` LIMIT $${paramCount}`;
        values.push(limit);
        paramCount++;
      }
      
      if (offset) {
        query += ` OFFSET $${paramCount}`;
        values.push(offset);
      }
      
      const result = await db.query<T>(query, values);
      return result.rows;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown database error');
      logger.error('Repository', `Error in ${this.tableName}.findAll:`, err);
      throw err;
    }
  }
  
  /**
   * Create a new entity
   */
  async create(data: Partial<T>): Promise<T> {
    try {
      const keys = Object.keys(data);
      const values = Object.values(data);
      
      if (keys.length === 0) {
        throw new Error('Cannot create entity with no data');
      }
      
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
      const columns = keys.join(', ');
      
      const query = `
        INSERT INTO ${this.tableName} (${columns})
        VALUES (${placeholders})
        RETURNING *
      `;
      
      const result = await db.query<T>(query, values);
      return result.rows[0];
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown database error');
      logger.error('Repository', `Error in ${this.tableName}.create:`, err);
      throw err;
    }
  }
  
  /**
   * Update an existing entity
   */
  async update(id: string, data: Partial<T>): Promise<T | null> {
    try {
      const keys = Object.keys(data);
      const values = Object.values(data);
      
      if (keys.length === 0) {
        throw new Error('Cannot update entity with no data');
      }
      
      const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
      
      const query = `
        UPDATE ${this.tableName}
        SET ${setClause}, updated_at = NOW()
        WHERE id = $${keys.length + 1}
        ${this.softDelete ? 'AND deleted_at IS NULL' : ''}
        RETURNING *
      `;
      
      const result = await db.query<T>(query, [...values, id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0];
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown database error');
      logger.error('Repository', `Error in ${this.tableName}.update:`, err);
      throw err;
    }
  }
  
  /**
   * Delete an entity
   */
  async delete(id: string, permanent = false): Promise<boolean> {
    try {
      let query: string;
      
      if (this.softDelete && !permanent) {
        // Soft delete
        query = `
          UPDATE ${this.tableName}
          SET deleted_at = NOW()
          WHERE id = $1 AND deleted_at IS NULL
        `;
      } else {
        // Hard delete
        query = `DELETE FROM ${this.tableName} WHERE id = $1`;
      }
      
      const result = await db.query(query, [id]);
      return result.rowCount ? result.rowCount > 0 : false;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown database error');
      logger.error('Repository', `Error in ${this.tableName}.delete:`, err);
      throw err;
    }
  }
  
  /**
   * Execute a transaction
   */
  async transaction<R>(callback: (client: any) => Promise<R>): Promise<R> {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      const err = error instanceof Error ? error : new Error('Unknown transaction error');
      logger.error('Repository', `Transaction error in ${this.tableName}:`, err);
      throw err;
    } finally {
      client.release();
    }
  }
  
  /**
   * Count entities
   */
  async count(where: Record<string, any> = {}, includeDeleted = false): Promise<number> {
    try {
      const whereClauses: string[] = [];
      const values: any[] = [];
      let paramCount = 1;
      
      // Add soft delete condition
      if (this.softDelete && !includeDeleted) {
        whereClauses.push(`deleted_at IS NULL`);
      }
      
      // Add where conditions
      Object.entries(where).forEach(([key, value]) => {
        // Handle null values
        if (value === null) {
          whereClauses.push(`${key} IS NULL`);
        } else {
          whereClauses.push(`${key} = $${paramCount}`);
          values.push(value);
          paramCount++;
        }
      });
      
      // Build query
      let query = `SELECT COUNT(*) as count FROM ${this.tableName}`;
      
      if (whereClauses.length > 0) {
        query += ` WHERE ${whereClauses.join(' AND ')}`;
      }
      
      const result = await db.query<{ count: string }>(query, values);
      return parseInt(result.rows[0].count);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown database error');
      logger.error('Repository', `Error in ${this.tableName}.count:`, err);
      throw err;
    }
  }
} 