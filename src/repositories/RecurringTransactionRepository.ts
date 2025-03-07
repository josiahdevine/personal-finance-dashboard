import { query } from '../db';
import { RecurringTransaction, FrequencyType } from '../types/CashFlowPrediction';

export class RecurringTransactionRepository {
    /**
     * Find all recurring transactions for a user
     */
    async findByUserId(userId: string): Promise<RecurringTransaction[]> {
        const sqlQuery = `
            SELECT * FROM recurring_transactions
            WHERE user_id = $1
            ORDER BY next_date ASC
        `;
        
        const result = await query(sqlQuery, [userId]);
        return result.map(this.mapRowToRecurringTransaction);
    }

    /**
     * Create a new recurring transaction
     */
    async create(transaction: Omit<RecurringTransaction, 'id' | 'createdAt'>): Promise<RecurringTransaction> {
        const columns = Object.keys(transaction).join(', ');
        const placeholders = Object.keys(transaction).map((_, i) => `$${i + 1}`).join(', ');
        
        const sqlQuery = `
            INSERT INTO recurring_transactions (${columns})
            VALUES (${placeholders})
            RETURNING *
        `;

        const values = Object.values(transaction);
        const result = await query(sqlQuery, values);
        return this.mapRowToRecurringTransaction(result[0]);
    }

    /**
     * Update an existing recurring transaction
     */
    async update(id: string, transaction: Partial<RecurringTransaction>): Promise<RecurringTransaction> {
        const updates = Object.keys(transaction)
            .map((key, i) => `${key} = $${i + 2}`)
            .join(', ');
        
        const sqlQuery = `
            UPDATE recurring_transactions
            SET ${updates}
            WHERE id = $1
            RETURNING *
        `;

        const values = [id, ...Object.values(transaction)];
        const result = await query(sqlQuery, values);
        return this.mapRowToRecurringTransaction(result[0]);
    }

    /**
     * Delete a recurring transaction
     */
    async delete(id: string): Promise<void> {
        const sqlQuery = `
            DELETE FROM recurring_transactions
            WHERE id = $1
        `;

        await query(sqlQuery, [id]);
    }

    /**
     * Find recurring transactions due in a date range
     */
    async findDueInRange(userId: string, startDate: string, endDate: string): Promise<RecurringTransaction[]> {
        const sqlQuery = `
            SELECT * FROM recurring_transactions
            WHERE user_id = $1
            AND next_date BETWEEN $2 AND $3
            ORDER BY next_date ASC
        `;

        const result = await query(sqlQuery, [userId, startDate, endDate]);
        return result.map(this.mapRowToRecurringTransaction);
    }

    /**
     * Map a database row to a RecurringTransaction object
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
} 