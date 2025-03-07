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
            JOIN securities s ON h.securityId = s.id
            WHERE h.investmentAccountId = $1
            ORDER BY s.name
        `;

        const result = await db.query(query, [accountId]);

        return result.rows.map(row => {
            const holding: InvestmentHolding = {
                id: row.id,
                investmentAccountId: row.investmentAccountId,
                securityId: row.securityId,
                costBasis: row.costBasis,
                quantity: row.quantity,
                value: row.value,
                institutionValue: row.institutionValue,
                institutionPrice: row.institutionPrice,
                institutionPriceAsOf: row.institutionPriceAsOf,
                isManual: row.isManual,
                createdAt: row.createdAt,
                updatedAt: row.updatedAt,
            };

            const security: Security = {
                id: row.securityId,
                tickerSymbol: row.tickerSymbol,
                name: row.name,
                type: row.type,
                closePrice: row.closePrice,
                closePriceAsOf: row.closePriceAsOf,
                isin: row.isin,
                cusip: row.cusip,
                currencyCode: row.currencyCode,
                isCashEquivalent: row.isCashEquivalent,
                createdAt: row.createdAt,
                updatedAt: row.updatedAt,
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
            WHERE investmentAccountId = $1 AND securityId = $2
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
                holding.investmentAccountId!,
                holding.securityId!
            );

            if (existingHolding) {
                // Update existing holding
                const updateQuery = `
                    UPDATE ${this.tableName}
                    SET
                        costBasis = COALESCE($1, costBasis),
                        quantity = COALESCE($2, quantity),
                        value = COALESCE($3, value),
                        institutionValue = COALESCE($4, institutionValue),
                        institutionPrice = COALESCE($5, institutionPrice),
                        institutionPriceAsOf = COALESCE($6, institutionPriceAsOf),
                        isManual = COALESCE($7, isManual),
                        updatedAt = NOW()
                    WHERE id = $8
                    RETURNING *
                `;

                const updateResult = await client.query(updateQuery, [
                    holding.costBasis,
                    holding.quantity,
                    holding.value,
                    holding.institutionValue,
                    holding.institutionPrice,
                    holding.institutionPriceAsOf,
                    holding.isManual,
                    existingHolding.id
                ]);

                await client.query('COMMIT');
                return updateResult.rows[0];
            }

            // Create new holding
            const insertQuery = `
                INSERT INTO ${this.tableName} (
                    investmentAccountId,
                    securityId,
                    costBasis,
                    quantity,
                    value,
                    institutionValue,
                    institutionPrice,
                    institutionPriceAsOf,
                    isManual
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING *
            `;

            const insertResult = await client.query(insertQuery, [
                holding.investmentAccountId,
                holding.securityId,
                holding.costBasis,
                holding.quantity,
                holding.value,
                holding.institutionValue,
                holding.institutionPrice,
                holding.institutionPriceAsOf,
                holding.isManual || false
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
        institutionValue?: number;
        institutionPrice?: number;
        institutionPriceAsOf?: string;
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
                        institutionValue = COALESCE($2, institutionValue),
                        institutionPrice = COALESCE($3, institutionPrice),
                        institutionPriceAsOf = COALESCE($4, institutionPriceAsOf),
                        updatedAt = NOW()
                    WHERE id = $5
                    `,
                    [
                        update.value,
                        update.institutionValue,
                        update.institutionPrice,
                        update.institutionPriceAsOf,
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