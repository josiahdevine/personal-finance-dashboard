const db = require('../db');

class TransactionModel {
    static async addTransaction(userId, transaction) {
        const {
            date,
            amount,
            description,
            category,
            accountId,
            source // 'plaid' or 'manual'
        } = transaction;

        const query = `
            INSERT INTO transactions (
                user_id, date, amount, description, 
                category, account_id, source
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
        `;
        
        const result = await db.query(query, [
            userId, date, amount, description, 
            category, accountId, source
        ]);
        return result.rows[0];
    }

    static async bulkAddTransactions(userId, transactions) {
        const query = `
            INSERT INTO transactions (
                user_id, date, amount, description, 
                category, account_id, source
            ) 
            SELECT * FROM UNNEST ($1::uuid[], $2::date[], $3::decimal[], 
                                $4::text[], $5::text[], $6::text[], $7::text[])
        `;

        const params = transactions.reduce((acc, t) => {
            acc[0].push(userId);
            acc[1].push(t.date);
            acc[2].push(t.amount);
            acc[3].push(t.description);
            acc[4].push(t.category);
            acc[5].push(t.accountId);
            acc[6].push(t.source);
            return acc;
        }, [[], [], [], [], [], [], []]);

        await db.query(query, params);
    }

    static async getSpendingSummary(userId, startDate, endDate) {
        const query = `
            WITH monthly_spending AS (
                SELECT 
                    category,
                    SUM(amount) as amount
                FROM transactions
                WHERE user_id = $1
                    AND date >= $2
                    AND date <= $3
                    AND amount < 0
                GROUP BY category
            )
            SELECT 
                category,
                ABS(amount) as amount
            FROM monthly_spending
            ORDER BY amount DESC
        `;

        const result = await db.query(query, [userId, startDate, endDate]);
        
        const total = result.rows.reduce((sum, row) => sum + parseFloat(row.amount), 0);
        
        return {
            total,
            categories: result.rows
        };
    }

    static async getTransactionsByCategory(userId, category, startDate, endDate) {
        const query = `
            SELECT *
            FROM transactions
            WHERE user_id = $1
                AND category = $2
                AND date >= $3
                AND date <= $4
            ORDER BY date DESC
        `;

        const result = await db.query(query, [userId, category, startDate, endDate]);
        return result.rows;
    }

    static async updateTransactionCategory(transactionId, userId, newCategory) {
        const query = `
            UPDATE transactions
            SET category = $1
            WHERE id = $2 AND user_id = $3
            RETURNING *
        `;

        const result = await db.query(query, [newCategory, transactionId, userId]);
        return result.rows[0];
    }
}

module.exports = TransactionModel; 