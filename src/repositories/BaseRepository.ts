import { db } from '../config/database';

export abstract class BaseRepository<T> {
    protected tableName: string;

    constructor(tableName: string) {
        this.tableName = tableName;
    }

    async findAll(): Promise<T[]> {
        const query = `
            SELECT * FROM ${this.tableName}
            WHERE deleted_at IS NULL
            ORDER BY created_at DESC
        `;

        const result = await db.query(query);
        return result.rows;
    }

    async findById(id: string): Promise<T | null> {
        const query = `
            SELECT * FROM ${this.tableName}
            WHERE id = $1 AND deleted_at IS NULL
        `;

        const result = await db.query(query, [id]);
        return result.rows[0] || null;
    }

    async create(data: Partial<T>): Promise<T> {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
        const columns = keys.join(', ');

        const query = `
            INSERT INTO ${this.tableName} (${columns})
            VALUES (${placeholders})
            RETURNING *
        `;

        const result = await db.query(query, values);
        return result.rows[0];
    }

    async update(id: string, data: Partial<T>): Promise<T | null> {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(', ');

        const query = `
            UPDATE ${this.tableName}
            SET ${setClause}
            WHERE id = $1 AND deleted_at IS NULL
            RETURNING *
        `;

        const result = await db.query(query, [id, ...values]);
        return result.rows[0] || null;
    }

    async softDelete(id: string): Promise<boolean> {
        const query = `
            UPDATE ${this.tableName}
            SET deleted_at = NOW()
            WHERE id = $1 AND deleted_at IS NULL
        `;

        const result = await db.query(query, [id]);
        return result.rowCount ? result.rowCount > 0 : false;
    }

    async hardDelete(id: string): Promise<boolean> {
        const query = `
            DELETE FROM ${this.tableName}
            WHERE id = $1
        `;

        const result = await db.query(query, [id]);
        return result.rowCount ? result.rowCount > 0 : false;
    }
} 