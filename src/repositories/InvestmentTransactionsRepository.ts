import { BaseRepository } from './BaseRepository';
import { InvestmentTransaction, Security } from '../types/Investment';
import { db } from '../config/database';

class InvestmentTransactionsRepository extends BaseRepository<InvestmentTransaction> {
    constructor() {
        super('investment_transactions');
    }

    /**
     * Get transactions for an account with securities
     */
    async getByAccountId(
        accountId: string,
        startDate: string,
        endDate: string
    ): Promise<Array<InvestmentTransaction & { security?: Security }>> {
        const query = `
            SELECT t.*, s.*
            FROM ${this.tableName} t
            LEFT JOIN securities s ON t.security_id = s.id
            WHERE t.investment_account_id = $1
            AND t.date BETWEEN $2 AND $3
            ORDER BY t.date DESC
        `;

        const result = await db.query(query, [accountId, startDate, endDate]);

        return result.rows.map(row => {
            const transaction: InvestmentTransaction = {
                id: row.id,
                investment_account_id: row.investment_account_id,
                security_id: row.security_id,
                transaction_type: row.transaction_type,
                amount: row.amount,
                quantity: row.quantity,
                price: row.price,
                fees: row.fees,
                date: row.date,
                name: row.name,
                description: row.description,
                created_at: row.created_at,
                updated_at: row.updated_at,
            };

            let security: Security | undefined;

            if (row.security_id) {
                security = {
                    id: row.security_id,
                    ticker_symbol: row.ticker_symbol,
                    name: row.name,
                    type: row.type,
                    close_price: row.close_price,
                    close_price_as_of: row.close_price_as_of,
                    isin: row.isin,
                    cusip: row.cusip,
                    currency_code: row.currency_code,
                    is_cash_equivalent: row.is_cash_equivalent,
                    created_at: row.created_at,
                    updated_at: row.updated_at,
                };
            }

            return {
                ...transaction,
                security,
            };
        });
    }

    /**
     * Create multiple transactions in a batch
     */
    async createBatch(transactions: Partial<InvestmentTransaction>[]): Promise<InvestmentTransaction[]> {
        const client = await db.getClient();

        try {
            await client.query('BEGIN');

            const results: InvestmentTransaction[] = [];

            for (const transaction of transactions) {
                const insertQuery = `
                    INSERT INTO ${this.tableName} (
                        investment_account_id,
                        security_id,
                        transaction_type,
                        amount,
                        quantity,
                        price,
                        fees,
                        date,
                        name,
                        description
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                    RETURNING *
                `;

                const insertResult = await client.query(insertQuery, [
                    transaction.investment_account_id,
                    transaction.security_id,
                    transaction.transaction_type,
                    transaction.amount,
                    transaction.quantity,
                    transaction.price,
                    transaction.fees,
                    transaction.date,
                    transaction.name,
                    transaction.description,
                ]);

                results.push(insertResult.rows[0]);
            }

            await client.query('COMMIT');
            return results;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Get transactions summary by type
     */
    async getSummaryByType(
        accountId: string,
        startDate: string,
        endDate: string
    ): Promise<Array<{
        transaction_type: string;
        total_amount: number;
        count: number;
    }>> {
        const query = `
            SELECT
                transaction_type,
                SUM(amount) as total_amount,
                COUNT(*) as count
            FROM ${this.tableName}
            WHERE investment_account_id = $1
            AND date BETWEEN $2 AND $3
            GROUP BY transaction_type
            ORDER BY total_amount DESC
        `;

        const result = await db.query(query, [accountId, startDate, endDate]);
        return result.rows;
    }

    /**
     * Get transactions summary by security
     */
    async getSummaryBySecurity(
        accountId: string,
        startDate: string,
        endDate: string
    ): Promise<Array<{
        security_id: string;
        ticker_symbol?: string;
        security_name: string;
        total_amount: number;
        total_quantity: number;
        transaction_count: number;
    }>> {
        const query = `
            SELECT
                t.security_id,
                s.ticker_symbol,
                s.name as security_name,
                SUM(t.amount) as total_amount,
                SUM(t.quantity) as total_quantity,
                COUNT(*) as transaction_count
            FROM ${this.tableName} t
            LEFT JOIN securities s ON t.security_id = s.id
            WHERE t.investment_account_id = $1
            AND t.date BETWEEN $2 AND $3
            AND t.security_id IS NOT NULL
            GROUP BY t.security_id, s.ticker_symbol, s.name
            ORDER BY total_amount DESC
        `;

        const result = await db.query(query, [accountId, startDate, endDate]);
        return result.rows;
    }
}

export const investmentTransactionsRepository = new InvestmentTransactionsRepository(); 