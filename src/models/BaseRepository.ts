import { query, queryOne, transaction } from '../db';
import { BaseModel } from './types';

export class BaseRepository<T extends BaseModel> {
  protected tableName: string;
  protected cachePrefix: string;
  protected cacheTimeout = 300; // 5 minutes default
  private cache: Map<string, { data: T; timestamp: number }> = new Map();

  constructor(tableName: string) {
    this.tableName = tableName;
    this.cachePrefix = `${tableName}_`;
  }

  protected getCacheKey(id: string): string {
    return `${this.cachePrefix}${id}`;
  }

  protected setCache(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  protected getCache(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.cacheTimeout * 1000) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  protected clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  async findById(id: string): Promise<T | null> {
    const cacheKey = this.getCacheKey(id);
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    const result = await queryOne<T>(
      `SELECT * FROM ${this.tableName} WHERE id = $1`,
      [id]
    );

    if (result) {
      this.setCache(cacheKey, result);
    }

    return result;
  }

  async findByUserId(userId: string): Promise<T[]> {
    const cacheKey = this.getCacheKey(`user_${userId}`);
    const cached = this.getCache(cacheKey);
    if (cached) return [cached];

    const results = await query<T>(
      `SELECT * FROM ${this.tableName} WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );

    return results;
  }

  async create(data: Partial<T>): Promise<T> {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

    const result = await queryOne<T>(
      `
      INSERT INTO ${this.tableName} (${columns.join(', ')})
      VALUES (${placeholders})
      RETURNING *
      `,
      values
    );

    if (!result) {
      throw new Error(`Failed to create ${this.tableName} record`);
    }

    this.setCache(this.getCacheKey(result.id), result);
    return result;
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const updates = Object.keys(data)
      .map((key, i) => `${key} = $${i + 2}`)
      .join(', ');

    const result = await queryOne<T>(
      `
      UPDATE ${this.tableName}
      SET ${updates}
      WHERE id = $1
      RETURNING *
      `,
      [id, ...Object.values(data)]
    );

    if (!result) {
      throw new Error(`${this.tableName} record not found`);
    }

    this.clearCache(this.getCacheKey(id));
    return result;
  }

  async delete(id: string): Promise<void> {
    await query(`DELETE FROM ${this.tableName} WHERE id = $1`, [id]);
    this.clearCache(this.getCacheKey(id));
  }

  async bulkCreate(records: Partial<T>[]): Promise<T[]> {
    return await transaction(async (client) => {
      const results: T[] = [];
      for (const record of records) {
        const columns = Object.keys(record);
        const values = Object.values(record);
        const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

        const result = await client(
          `
            INSERT INTO ${this.tableName} (${columns.join(', ')})
            VALUES (${placeholders})
            RETURNING *
          `,
          values
        );

        if (result[0]) {
          const insertedRecord = result[0] as T;
          results.push(insertedRecord);
          this.setCache(this.getCacheKey(insertedRecord.id), insertedRecord);
        }
      }
      return results;
    });
  }

  async findWhere(conditions: Partial<T>): Promise<T[]> {
    const whereClause = Object.keys(conditions)
      .map((key, i) => `${key} = $${i + 1}`)
      .join(' AND ');

    return await query<T>(
      `SELECT * FROM ${this.tableName} WHERE ${whereClause}`,
      Object.values(conditions)
    );
  }

  async count(conditions: Partial<T> = {}): Promise<number> {
    const whereClause = Object.keys(conditions).length
      ? 'WHERE ' + Object.keys(conditions)
          .map((key, i) => `${key} = $${i + 1}`)
          .join(' AND ')
      : '';

    const result = await queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM ${this.tableName} ${whereClause}`,
      Object.values(conditions)
    );

    return result ? parseInt(result.count, 10) : 0;
  }
} 