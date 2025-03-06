import { db } from '../db';
import { RecurringTransaction, FrequencyType } from '../types/CashFlowPrediction';

export class RecurringTransactionRepository {
    /**
     * Find recurring transactions for a user
     */
    async findByUserId(userId: string): Promise<RecurringTransaction[]> {
        const query = `
            SELECT *
            FROM recurring_transactions
            WHERE user_id = $1 AND is_active = true
            ORDER BY next_predicted_date ASC
        `;
        
        const result = await db.query(query, [userId]);
        return result.rows.map(this.mapRowToRecurringTransaction);
    }

    /**
     * Create a new recurring transaction
     */
    async create(transaction: Omit<RecurringTransaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<RecurringTransaction> {
        const query = `
            INSERT INTO recurring_transactions (
                user_id, merchant_name, amount, frequency, day_of_month,
                last_date, next_predicted_date, category, confidence, is_active
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `;

        const values = [
            transaction.userId,
            transaction.merchantName,
            transaction.amount,
            transaction.frequency,
            transaction.dayOfMonth,
            transaction.lastDate,
            transaction.nextPredictedDate,
            transaction.category,
            transaction.confidence,
            transaction.isActive
        ];

        const result = await db.query(query, values);
        return this.mapRowToRecurringTransaction(result.rows[0]);
    }

    /**
     * Update a recurring transaction
     */
    async update(id: string, transaction: Partial<RecurringTransaction>): Promise<RecurringTransaction> {
        const setClause = Object.keys(transaction)
            .map((key, index) => `${this.toSnakeCase(key)} = $${index + 2}`)
            .join(', ');

        const query = `
            UPDATE recurring_transactions
            SET ${setClause}
            WHERE id = $1
            RETURNING *
        `;

        const values = [id, ...Object.values(transaction)];
        const result = await db.query(query, values);
        return this.mapRowToRecurringTransaction(result.rows[0]);
    }

    /**
     * Deactivate a recurring transaction
     */
    async deactivate(id: string): Promise<void> {
        const query = `
            UPDATE recurring_transactions
            SET is_active = false
            WHERE id = $1
        `;

        await db.query(query, [id]);
    }

    /**
     * Find recurring transactions by next predicted date range
     */
    async findByDateRange(userId: string, startDate: string, endDate: string): Promise<RecurringTransaction[]> {
        const query = `
            SELECT *
            FROM recurring_transactions
            WHERE user_id = $1
            AND is_active = true
            AND next_predicted_date BETWEEN $2 AND $3
            ORDER BY next_predicted_date ASC
        `;

        const result = await db.query(query, [userId, startDate, endDate]);
        return result.rows.map(this.mapRowToRecurringTransaction);
    }

    /**
     * Map database row to RecurringTransaction type
     */
    private mapRowToRecurringTransaction(row: any): RecurringTransaction {
        return {
            id: row.id,
            userId: row.user_id,
            merchantName: row.merchant_name,
            amount: parseFloat(row.amount),
            frequency: row.frequency as FrequencyType,
            dayOfMonth: row.day_of_month,
            lastDate: row.last_date,
            nextPredictedDate: row.next_predicted_date,
            category: row.category,
            confidence: row.confidence,
            isActive: row.is_active,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }

    /**
     * Convert camelCase to snake_case
     */
    private toSnakeCase(str: string): string {
        return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    }
} 