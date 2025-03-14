import { BaseRepository } from './BaseRepository';
import { Security } from '../types/Investment';
import { db } from '../config/database';

class SecuritiesRepository extends BaseRepository<Security> {
    constructor() {
        super('securities');
    }

    /**
     * Find security by ticker symbol
     */
    async findByTicker(ticker: string): Promise<Security | null> {
        const query = `
            SELECT *
            FROM ${this.tableName}
            WHERE ticker_symbol = $1
        `;

        const result = await db.query(query, [ticker]);
        return result.rows[0] || null;
    }

    /**
     * Find security by ISIN
     */
    async findByIsin(isin: string): Promise<Security | null> {
        const query = `
            SELECT *
            FROM ${this.tableName}
            WHERE isin = $1
        `;

        const result = await db.query(query, [isin]);
        return result.rows[0] || null;
    }

    /**
     * Find security by CUSIP
     */
    async findByCusip(cusip: string): Promise<Security | null> {
        const query = `
            SELECT *
            FROM ${this.tableName}
            WHERE cusip = $1
        `;

        const result = await db.query(query, [cusip]);
        return result.rows[0] || null;
    }

    /**
     * Find or create security by ticker symbol
     */
    async findOrCreate(security: Partial<Security>): Promise<Security> {
        const client = await db.getClient();

        try {
            await client.query('BEGIN');

            let existingSecurity: Security | null = null;

            // Try to find by ticker
            if (security.tickerSymbol) {
                const tickerResult = await client.query(
                    `SELECT * FROM ${this.tableName} WHERE ticker_symbol = $1`,
                    [security.tickerSymbol]
                );
                if (tickerResult.rows.length > 0) {
                    existingSecurity = tickerResult.rows[0];
                }
            }

            // Try to find by ISIN
            if (!existingSecurity && security.isin) {
                const isinResult = await client.query(
                    `SELECT * FROM ${this.tableName} WHERE isin = $1`,
                    [security.isin]
                );
                if (isinResult.rows.length > 0) {
                    existingSecurity = isinResult.rows[0];
                }
            }

            // Try to find by CUSIP
            if (!existingSecurity && security.cusip) {
                const cusipResult = await client.query(
                    `SELECT * FROM ${this.tableName} WHERE cusip = $1`,
                    [security.cusip]
                );
                if (cusipResult.rows.length > 0) {
                    existingSecurity = cusipResult.rows[0];
                }
            }

            // If security exists, update it
            if (existingSecurity) {
                const updateQuery = `
                    UPDATE ${this.tableName}
                    SET 
                        name = $1,
                        type = $2,
                        close_price = $3,
                        close_price_as_of = $4,
                        currency_code = $5,
                        is_cash_equivalent = $6,
                        updated_at = NOW()
                    WHERE id = $7
                    RETURNING *
                `;

                const updateResult = await client.query(updateQuery, [
                    security.name,
                    security.type,
                    security.closePrice,
                    security.closePriceAsOf,
                    security.currencyCode,
                    security.isCashEquivalent,
                    existingSecurity.id
                ]);

                await client.query('COMMIT');
                return updateResult.rows[0];
            }

            // Create new security
            const insertQuery = `
                INSERT INTO ${this.tableName} (
                    ticker_symbol, name, type, close_price, close_price_as_of,
                    isin, cusip, currency_code, is_cash_equivalent
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING *
            `;

            const insertResult = await client.query(insertQuery, [
                security.tickerSymbol,
                security.name,
                security.type || 'equity',
                security.closePrice,
                security.closePriceAsOf,
                security.isin,
                security.cusip,
                security.currencyCode || 'USD',
                security.isCashEquivalent || false
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
     * Update security prices
     */
    async updatePrices(updates: Array<{ id: string; close_price: number; close_price_as_of: string }>): Promise<void> {
        const client = await db.getClient();

        try {
            await client.query('BEGIN');

            for (const update of updates) {
                await client.query(
                    `
                    UPDATE ${this.tableName}
                    SET
                        close_price = $1,
                        close_price_as_of = $2,
                        updated_at = NOW()
                    WHERE id = $3
                    `,
                    [update.close_price, update.close_price_as_of, update.id]
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

export const securitiesRepository = new SecuritiesRepository(); 