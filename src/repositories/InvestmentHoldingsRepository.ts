import { BaseRepository } from './BaseRepository';
import { InvestmentHolding, Security } from '../types/Investment';
import { db } from '../config/database';

class InvestmentHoldingsRepository extends BaseRepository<InvestmentHolding> {
    constructor() {
        super('investment_holdings');
    }

    /**
     * Get holdings for an account with securities
     */
    async getByAccountId(accountId: string): Promise<Array<InvestmentHolding & { security: Security }>> {
        const query = `
            SELECT h.*, s.*
            FROM ${this.tableName} h
            JOIN securities s ON h.security_id = s.id
            WHERE h.investment_account_id = $1
            ORDER BY s.name
        `;

        const result = await db.query(query, [accountId]);

        return result.rows.map(row => {
            const holding: InvestmentHolding = {
                id: row.id,
                investment_account_id: row.investment_account_id,
                security_id: row.security_id,
                cost_basis: row.cost_basis,
                quantity: row.quantity,
                value: row.value,
                institution_value: row.institution_value,
                institution_price: row.institution_price,
                institution_price_as_of: row.institution_price_as_of,
                is_manual: row.is_manual,
                created_at: row.created_at,
                updated_at: row.updated_at,
            };

            const security: Security = {
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

            return {
                ...holding,
                security,
            };
        });
    }

    /**
     * Get holding by account and security
     */
    async getByAccountAndSecurity(accountId: string, securityId: string): Promise<InvestmentHolding | null> {
        const query = `
            SELECT *
            FROM ${this.tableName}
            WHERE investment_account_id = $1 AND security_id = $2
        `;

        const result = await db.query(query, [accountId, securityId]);
        return result.rows[0] || null;
    }

    /**
     * Update or create holding
     */
    async upsert(holding: Partial<InvestmentHolding>): Promise<InvestmentHolding> {
        const client = await db.getClient();

        try {
            await client.query('BEGIN');

            // Check if holding exists
            const existingHolding = await this.getByAccountAndSecurity(
                holding.investment_account_id!,
                holding.security_id!
            );

            if (existingHolding) {
                // Update existing holding
                const updateQuery = `
                    UPDATE ${this.tableName}
                    SET
                        cost_basis = COALESCE($1, cost_basis),
                        quantity = COALESCE($2, quantity),
                        value = COALESCE($3, value),
                        institution_value = COALESCE($4, institution_value),
                        institution_price = COALESCE($5, institution_price),
                        institution_price_as_of = COALESCE($6, institution_price_as_of),
                        is_manual = COALESCE($7, is_manual),
                        updated_at = NOW()
                    WHERE id = $8
                    RETURNING *
                `;

                const updateResult = await client.query(updateQuery, [
                    holding.cost_basis,
                    holding.quantity,
                    holding.value,
                    holding.institution_value,
                    holding.institution_price,
                    holding.institution_price_as_of,
                    holding.is_manual,
                    existingHolding.id
                ]);

                await client.query('COMMIT');
                return updateResult.rows[0];
            }

            // Create new holding
            const insertQuery = `
                INSERT INTO ${this.tableName} (
                    investment_account_id,
                    security_id,
                    cost_basis,
                    quantity,
                    value,
                    institution_value,
                    institution_price,
                    institution_price_as_of,
                    is_manual
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING *
            `;

            const insertResult = await client.query(insertQuery, [
                holding.investment_account_id,
                holding.security_id,
                holding.cost_basis,
                holding.quantity,
                holding.value,
                holding.institution_value,
                holding.institution_price,
                holding.institution_price_as_of,
                holding.is_manual || false
            ]);

            await client.query('COMMIT');
            return insertResult.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Update holding values
     */
    async updateValues(updates: Array<{
        id: string;
        value: number;
        institution_value?: number;
        institution_price?: number;
        institution_price_as_of?: string;
    }>): Promise<void> {
        const client = await db.getClient();

        try {
            await client.query('BEGIN');

            for (const update of updates) {
                await client.query(
                    `
                    UPDATE ${this.tableName}
                    SET
                        value = $1,
                        institution_value = COALESCE($2, institution_value),
                        institution_price = COALESCE($3, institution_price),
                        institution_price_as_of = COALESCE($4, institution_price_as_of),
                        updated_at = NOW()
                    WHERE id = $5
                    `,
                    [
                        update.value,
                        update.institution_value,
                        update.institution_price,
                        update.institution_price_as_of,
                        update.id
                    ]
                );
            }

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}

export const investmentHoldingsRepository = new InvestmentHoldingsRepository(); 