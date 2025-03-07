import { BaseRepository } from './BaseRepository';
import { InvestmentAccount, InvestmentHolding, Security, InvestmentTransaction } from '../types/Investment';
import { db } from '../config/database';

class InvestmentAccountRepository extends BaseRepository<InvestmentAccount> {
    constructor() {
        super('investment_accounts');
    }

    /**
     * Find all investment accounts for a user
     */
    async findByUserId(userId: string): Promise<InvestmentAccount[]> {
        const query = `
            SELECT *
            FROM ${this.tableName}
            WHERE user_id = $1 AND deleted_at IS NULL
            ORDER BY name
        `;

        const result = await db.query(query, [userId]);
        return result.rows.map(this.mapRowToAccount);
    }

    /**
     * Find investment account by ID
     */
    async findById(id: string): Promise<InvestmentAccount | null> {
        const query = `
            SELECT *
            FROM ${this.tableName}
            WHERE id = $1 AND deleted_at IS NULL
        `;

        const result = await db.query(query, [id]);
        return result.rows[0] ? this.mapRowToAccount(result.rows[0]) : null;
    }

    /**
     * Find investment account by ID and user ID
     */
    async findByIdAndUserId(id: string, userId: string): Promise<InvestmentAccount | null> {
        const query = `
            SELECT *
            FROM ${this.tableName}
            WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
        `;

        const result = await db.query(query, [id, userId]);
        return result.rows[0] ? this.mapRowToAccount(result.rows[0]) : null;
    }

    /**
     * Map a database row to an InvestmentAccount object
     */
    private mapRowToAccount(row: any): InvestmentAccount {
        return {
            id: row.id,
            userId: row.user_id,
            name: row.name,
            type: row.type,
            subtype: row.subtype,
            balance: row.balance,
            currency: row.currency_code,
            institution: row.institution_name,
            lastUpdated: row.last_updated,
            status: row.is_closed ? 'inactive' : 'active',
            holdings: []
        };
    }

    /**
     * Map a database row to an InvestmentHolding object
     */
    private mapRowToHolding(row: any): InvestmentHolding {
        return {
            id: row.id,
            investmentAccountId: row.investment_account_id,
            securityId: row.security_id,
            quantity: row.quantity,
            costBasis: row.cost_basis,
            value: row.value,
            institutionValue: row.institution_value,
            institutionPrice: row.institution_price,
            institutionPriceAsOf: row.institution_price_as_of,
            isManual: row.is_manual,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }

    /**
     * Map a database row to a Security object
     */
    private mapRowToSecurity(row: any): Security {
        return {
            id: row.id,
            tickerSymbol: row.ticker_symbol,
            name: row.name,
            type: row.type,
            closePrice: row.close_price,
            closePriceAsOf: row.close_price_as_of,
            isin: row.isin,
            cusip: row.cusip,
            currencyCode: row.currency_code,
            isCashEquivalent: row.is_cash_equivalent,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }

    /**
     * Map a database row to an InvestmentTransaction object
     */
    private mapRowToTransaction(row: any): InvestmentTransaction {
        return {
            id: row.id,
            investmentAccountId: row.investment_account_id,
            securityId: row.security_id,
            transactionType: row.transaction_type,
            quantity: row.quantity,
            price: row.price,
            amount: row.amount,
            fees: row.fees,
            date: row.date,
            name: row.name,
            description: row.description,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }

    /**
     * Get all holdings for an investment account
     */
    async getHoldings(accountId: string, userId: string): Promise<Array<InvestmentHolding & { security: Security }>> {
        // First verify the account belongs to the user
        const accountQuery = `
            SELECT id FROM ${this.tableName}
            WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
        `;

        const accountResult = await db.query(accountQuery, [accountId, userId]);

        if (accountResult.rows.length === 0) {
            throw new Error('Investment account not found or access denied');
        }

        // Get holdings with securities
        const query = `
            SELECT h.*, s.*
            FROM investment_holdings h
            JOIN securities s ON h.security_id = s.id
            WHERE h.investment_account_id = $1
            ORDER BY s.name
        `;

        const result = await db.query(query, [accountId]);

        return result.rows.map(row => {
            const holding: InvestmentHolding = {
                id: row.id,
                investmentAccountId: row.investment_account_id,
                securityId: row.security_id,
                quantity: row.quantity,
                costBasis: row.cost_basis,
                value: row.value,
                institutionValue: row.institution_value,
                institutionPrice: row.institution_price,
                institutionPriceAsOf: row.institution_price_as_of,
                isManual: row.is_manual,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
            };

            const security: Security = {
                id: row.security_id,
                tickerSymbol: row.ticker_symbol,
                name: row.name,
                type: row.type,
                closePrice: row.close_price,
                closePriceAsOf: row.close_price_as_of,
                isin: row.isin,
                cusip: row.cusip,
                currencyCode: row.currency_code,
                isCashEquivalent: row.is_cash_equivalent,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
            };

            return {
                ...holding,
                security,
            };
        });
    }

    /**
     * Get transactions for an investment account
     */
    async getTransactions(
        accountId: string,
        userId: string,
        startDate: string,
        endDate: string
    ): Promise<Array<InvestmentTransaction & { security?: Security }>> {
        // First verify the account belongs to the user
        const accountQuery = `
            SELECT id FROM ${this.tableName}
            WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
        `;

        const accountResult = await db.query(accountQuery, [accountId, userId]);

        if (accountResult.rows.length === 0) {
            throw new Error('Investment account not found or access denied');
        }

        // Get transactions with securities
        const query = `
            SELECT t.*, s.*
            FROM investment_transactions t
            LEFT JOIN securities s ON t.security_id = s.id
            WHERE t.investment_account_id = $1
            AND t.date BETWEEN $2 AND $3
            ORDER BY t.date DESC
        `;

        const result = await db.query(query, [accountId, startDate, endDate]);

        return result.rows.map(row => {
            const transaction: InvestmentTransaction = {
                id: row.id,
                investmentAccountId: row.investment_account_id,
                securityId: row.security_id,
                transactionType: row.transaction_type,
                quantity: row.quantity,
                price: row.price,
                amount: row.amount,
                fees: row.fees,
                date: row.date,
                name: row.name,
                description: row.description,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
            };

            let security: Security | undefined;

            if (row.security_id) {
                security = {
                    id: row.security_id,
                    tickerSymbol: row.ticker_symbol,
                    name: row.name,
                    type: row.type,
                    closePrice: row.close_price,
                    closePriceAsOf: row.close_price_as_of,
                    isin: row.isin,
                    cusip: row.cusip,
                    currencyCode: row.currency_code,
                    isCashEquivalent: row.is_cash_equivalent,
                    createdAt: row.created_at,
                    updatedAt: row.updated_at,
                };
            }

            return {
                ...transaction,
                security,
            };
        });
    }

    /**
     * Create a manual investment account
     */
    async createManualAccount(account: Partial<InvestmentAccount>, userId: string): Promise<InvestmentAccount> {
        const query = `
            INSERT INTO ${this.tableName} (
                user_id, name, type, subtype, institution_name, 
                balance, currency_code, is_manual, is_hidden, is_closed
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `;

        const values = [
            userId,
            account.name,
            account.type,
            account.subtype,
            account.institution,
            account.balance || 0,
            account.currency || 'USD',
            true, // is_manual
            false, // is_hidden
            account.status === 'inactive' || false,
        ];

        const result = await db.query(query, values);
        return this.mapRowToAccount(result.rows[0]);
    }

    /**
     * Add a holding to an investment account
     */
    async addHolding(
        accountId: string,
        userId: string,
        holding: Partial<InvestmentHolding>,
        security: Partial<Security>
    ): Promise<InvestmentHolding & { security: Security }> {
        // First verify the account belongs to the user
        const accountQuery = `
            SELECT id FROM ${this.tableName}
            WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
        `;

        const accountResult = await db.query(accountQuery, [accountId, userId]);

        if (accountResult.rows.length === 0) {
            throw new Error('Investment account not found or access denied');
        }

        // Start a transaction
        const client = await db.getClient();

        try {
            await client.query('BEGIN');

            // Check if the security already exists
            let securityId: string;

            if (security.tickerSymbol) {
                // Try to find by ticker
                const existingSecurityQuery = `
                    SELECT id FROM securities
                    WHERE ticker_symbol = $1
                `;

                const existingSecurityResult = await client.query(existingSecurityQuery, [security.tickerSymbol]);

                if (existingSecurityResult.rows.length > 0) {
                    securityId = existingSecurityResult.rows[0].id;
                } else {
                    // Create new security
                    const newSecurityQuery = `
                        INSERT INTO securities (
                            ticker_symbol, name, type, currency_code, is_cash_equivalent
                        )
                        VALUES ($1, $2, $3, $4, $5)
                        RETURNING id
                    `;

                    const newSecurityResult = await client.query(newSecurityQuery, [
                        security.tickerSymbol,
                        security.name,
                        security.type || 'equity',
                        security.currencyCode || 'USD',
                        security.isCashEquivalent || false,
                    ]);

                    securityId = newSecurityResult.rows[0].id;
                }
            } else {
                // Create new security without ticker
                const newSecurityQuery = `
                    INSERT INTO securities (
                        name, type, currency_code, is_cash_equivalent
                    )
                    VALUES ($1, $2, $3, $4)
                    RETURNING id
                `;

                const newSecurityResult = await client.query(newSecurityQuery, [
                    security.name,
                    security.type || 'other',
                    security.currencyCode || 'USD',
                    security.isCashEquivalent || false,
                ]);

                securityId = newSecurityResult.rows[0].id;
            }

            // Create the holding
            const holdingQuery = `
                INSERT INTO investment_holdings (
                    investment_account_id, security_id, quantity, cost_basis,
                    value, is_manual
                )
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
            `;

            const holdingResult = await client.query(holdingQuery, [
                accountId,
                securityId,
                holding.quantity,
                holding.costBasis,
                holding.value,
                true // is_manual
            ]);

            // Get the security details
            const securityQuery = `
                SELECT * FROM securities WHERE id = $1
            `;

            const securityResult = await client.query(securityQuery, [securityId]);

            await client.query('COMMIT');

            const holdingData = this.mapRowToHolding(holdingResult.rows[0]);
            const securityData = this.mapRowToSecurity(securityResult.rows[0]);

            return {
                ...holdingData,
                security: securityData
            };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}

export const investmentAccountRepository = new InvestmentAccountRepository(); 