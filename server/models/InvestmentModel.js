const pool = require('../db');
const axios = require('axios');

class InvestmentModel {
    // Create a new investment
    static async createInvestment(manualAccountId, investmentData) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const {
                symbol,
                total_value,
                purchase_date,
                current_price = null
            } = investmentData;

            // If we have a symbol, fetch current price
            let price = current_price;
            if (symbol && !price) {
                price = await this.fetchCurrentPrice(symbol);
            }

            // Calculate quantity based on total value and price
            const quantity = price ? total_value / price : 1;
            const costBasisPerUnit = price || total_value;

            const query = `
                INSERT INTO investment_details (
                    manual_account_id, symbol, quantity,
                    cost_basis_per_unit, total_cost_basis,
                    purchase_date, last_price_update
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *
            `;
            const values = [
                manualAccountId,
                symbol,
                quantity,
                costBasisPerUnit,
                total_value,
                purchase_date,
                price ? new Date() : null
            ];

            const result = await client.query(query, values);
            const investment = result.rows[0];

            // If we have a price, record it in price history
            if (price) {
                await this.recordPrice(investment.id, price, new Date());
            }

            await client.query('COMMIT');
            return investment;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // Fetch current price from external API
    static async fetchCurrentPrice(symbol) {
        try {
            // Replace with your actual stock API endpoint and key
            const response = await axios.get(`https://api.example.com/stocks/${symbol}/price`, {
                headers: {
                    'Authorization': `Bearer ${process.env.STOCK_API_KEY}`
                }
            });
            return response.data.price;
        } catch (error) {
            console.error(`Error fetching price for ${symbol}:`, error);
            throw error;
        }
    }

    // Record a price point
    static async recordPrice(investmentId, price, date = new Date()) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Record price in history
            const historyQuery = `
                INSERT INTO investment_price_history (
                    investment_detail_id, price_date, price
                ) VALUES ($1, $2, $3)
                RETURNING *
            `;
            await client.query(historyQuery, [investmentId, date, price]);

            // Update last price in investment details
            const updateQuery = `
                UPDATE investment_details
                SET last_price_update = $1
                WHERE id = $2
            `;
            await client.query(updateQuery, [date, investmentId]);

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // Get investment details with price history
    static async getInvestmentDetails(investmentId) {
        const query = `
            SELECT 
                id.*,
                json_agg(
                    json_build_object(
                        'date', iph.price_date,
                        'price', iph.price
                    ) ORDER BY iph.price_date DESC
                ) as price_history
            FROM investment_details id
            LEFT JOIN investment_price_history iph ON id.id = iph.investment_detail_id
            WHERE id.id = $1
            GROUP BY id.id
        `;
        const result = await pool.query(query, [investmentId]);
        return result.rows[0];
    }

    // Get all investments for a user
    static async getUserInvestments(userId) {
        const query = `
            SELECT 
                id.*,
                ma.name as account_name,
                ma.type as account_type,
                (
                    SELECT price
                    FROM investment_price_history
                    WHERE investment_detail_id = id.id
                    ORDER BY price_date DESC
                    LIMIT 1
                ) as current_price,
                (
                    SELECT json_agg(
                        json_build_object(
                            'date', price_date,
                            'price', price
                        ) ORDER BY price_date DESC
                        LIMIT 30
                    )
                    FROM investment_price_history
                    WHERE investment_detail_id = id.id
                ) as recent_prices
            FROM investment_details id
            JOIN manual_accounts ma ON id.manual_account_id = ma.id
            WHERE ma.user_id = $1
            ORDER BY ma.name
        `;
        const result = await pool.query(query, [userId]);
        return result.rows;
    }

    // Update investment quantities (e.g., for stock splits or additional purchases)
    static async updateQuantity(investmentId, newQuantity, reason = 'manual_update') {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const query = `
                UPDATE investment_details
                SET quantity = $1,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $2
                RETURNING *
            `;
            const result = await client.query(query, [newQuantity, investmentId]);

            await client.query('COMMIT');
            return result.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // Calculate investment performance
    static async calculatePerformance(investmentId) {
        const query = `
            WITH latest_price AS (
                SELECT price
                FROM investment_price_history
                WHERE investment_detail_id = $1
                ORDER BY price_date DESC
                LIMIT 1
            )
            SELECT 
                id.*,
                lp.price as current_price,
                (lp.price * id.quantity) as current_value,
                (lp.price * id.quantity - id.total_cost_basis) as total_gain,
                ((lp.price * id.quantity - id.total_cost_basis) / id.total_cost_basis * 100) as return_percentage
            FROM investment_details id
            CROSS JOIN latest_price lp
            WHERE id.id = $1
        `;
        const result = await pool.query(query, [investmentId]);
        return result.rows[0];
    }
}

module.exports = InvestmentModel; 