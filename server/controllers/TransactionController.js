const pool = require('../db');

class TransactionController {
    static async getSpendingSummary(req, res) {
        try {
            const userId = req.user.id;
            const { startDate, endDate } = req.query;

            // Default to last 30 days if no dates provided
            const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const end = endDate ? new Date(endDate) : new Date();

            // Get total spending and category breakdown
            const query = `
                WITH transaction_totals AS (
                    SELECT 
                        category,
                        SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as total_amount
                    FROM transactions
                    WHERE user_id = $1
                    AND date >= $2
                    AND date <= $3
                    GROUP BY category
                )
                SELECT 
                    category,
                    total_amount as amount,
                    ROUND((total_amount / SUM(total_amount) OVER()) * 100, 2) as percentage
                FROM transaction_totals
                WHERE total_amount > 0
                ORDER BY total_amount DESC
            `;

            const result = await pool.query(query, [userId, start, end]);

            // Calculate total spending
            const total = result.rows.reduce((sum, row) => sum + parseFloat(row.amount), 0);

            // Format response
            const response = {
                total,
                period: {
                    start: start.toISOString(),
                    end: end.toISOString()
                },
                categories: result.rows.map(row => ({
                    name: row.category,
                    amount: parseFloat(row.amount),
                    percentage: parseFloat(row.percentage)
                }))
            };

            res.json(response);
        } catch (error) {
            console.error('Error fetching spending summary:', error);
            res.status(500).json({
                error: 'Failed to fetch spending summary',
                message: error.message
            });
        }
    }

    static async getTransactions(req, res) {
        try {
            const userId = req.user.id;
            const { startDate, endDate, category, limit = 50, offset = 0 } = req.query;

            let query = `
                SELECT *
                FROM transactions
                WHERE user_id = $1
            `;
            const params = [userId];
            let paramCount = 1;

            if (startDate) {
                paramCount++;
                query += ` AND date >= $${paramCount}`;
                params.push(new Date(startDate));
            }

            if (endDate) {
                paramCount++;
                query += ` AND date <= $${paramCount}`;
                params.push(new Date(endDate));
            }

            if (category) {
                paramCount++;
                query += ` AND category = $${paramCount}`;
                params.push(category);
            }

            query += ` ORDER BY date DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
            params.push(limit, offset);

            const result = await pool.query(query, params);
            res.json(result.rows);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            res.status(500).json({
                error: 'Failed to fetch transactions',
                message: error.message
            });
        }
    }

    static async getTransactionById(req, res) {
        try {
            const userId = req.user.id;
            const { id } = req.params;

            const query = `
                SELECT *
                FROM transactions
                WHERE id = $1 AND user_id = $2
            `;

            const result = await pool.query(query, [id, userId]);

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Transaction not found' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error fetching transaction:', error);
            res.status(500).json({
                error: 'Failed to fetch transaction',
                message: error.message
            });
        }
    }

    static async addTransaction(req, res) {
        try {
            const userId = req.user.id;
            const { amount, date, description, category } = req.body;

            const query = `
                INSERT INTO transactions (user_id, amount, date, description, category)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            `;

            const result = await pool.query(query, [userId, amount, date, description, category]);
            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Error adding transaction:', error);
            res.status(500).json({
                error: 'Failed to add transaction',
                message: error.message
            });
        }
    }

    static async updateTransaction(req, res) {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            const { amount, date, description, category } = req.body;

            const query = `
                UPDATE transactions
                SET amount = $1, date = $2, description = $3, category = $4
                WHERE id = $5 AND user_id = $6
                RETURNING *
            `;

            const result = await pool.query(query, [amount, date, description, category, id, userId]);

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Transaction not found' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error updating transaction:', error);
            res.status(500).json({
                error: 'Failed to update transaction',
                message: error.message
            });
        }
    }

    static async deleteTransaction(req, res) {
        try {
            const userId = req.user.id;
            const { id } = req.params;

            const query = `
                DELETE FROM transactions
                WHERE id = $1 AND user_id = $2
                RETURNING *
            `;

            const result = await pool.query(query, [id, userId]);

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Transaction not found' });
            }

            res.json({ message: 'Transaction deleted successfully' });
        } catch (error) {
            console.error('Error deleting transaction:', error);
            res.status(500).json({
                error: 'Failed to delete transaction',
                message: error.message
            });
        }
    }
}

module.exports = TransactionController; 