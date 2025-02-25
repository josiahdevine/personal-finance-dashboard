const pool = require('../db');

class SalaryController {
    static async getMonthlySummary(req, res) {
        try {
            const userId = req.user.id;
            
            // Get average monthly income for the last 6 months
            const query = `
                SELECT 
                    COALESCE(AVG(amount), 0) as monthly_income
                FROM salary_entries
                WHERE user_id = $1
                AND date >= NOW() - INTERVAL '6 months'
            `;

            const result = await pool.query(query, [userId]);
            const monthlyIncome = parseFloat(result.rows[0].monthly_income);

            res.json({
                monthlyIncome,
                period: '6 months',
                currency: 'USD'
            });
        } catch (error) {
            console.error('Error fetching monthly salary summary:', error);
            res.status(500).json({
                error: 'Failed to fetch monthly salary summary',
                message: error.message
            });
        }
    }

    static async addSalaryEntry(req, res) {
        try {
            const userId = req.user.id;
            const { amount, date, description } = req.body;

            const query = `
                INSERT INTO salary_entries (user_id, amount, date, description)
                VALUES ($1, $2, $3, $4)
                RETURNING *
            `;

            const result = await pool.query(query, [userId, amount, date, description]);
            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Error adding salary entry:', error);
            res.status(500).json({
                error: 'Failed to add salary entry',
                message: error.message
            });
        }
    }

    static async updateSalaryEntry(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const { amount, date, description } = req.body;

            const query = `
                UPDATE salary_entries
                SET amount = $1, date = $2, description = $3
                WHERE id = $4 AND user_id = $5
                RETURNING *
            `;

            const result = await pool.query(query, [amount, date, description, id, userId]);

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Salary entry not found' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error updating salary entry:', error);
            res.status(500).json({
                error: 'Failed to update salary entry',
                message: error.message
            });
        }
    }

    static async deleteSalaryEntry(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const query = `
                DELETE FROM salary_entries
                WHERE id = $1 AND user_id = $2
                RETURNING *
            `;

            const result = await pool.query(query, [id, userId]);

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Salary entry not found' });
            }

            res.json({ message: 'Salary entry deleted successfully' });
        } catch (error) {
            console.error('Error deleting salary entry:', error);
            res.status(500).json({
                error: 'Failed to delete salary entry',
                message: error.message
            });
        }
    }

    static async getSalaryEntries(req, res) {
        try {
            const userId = req.user.id;
            const userProfileId = req.query.userProfileId;
            
            console.log('Fetching salary entries for user:', userId, 'profile:', userProfileId);
            
            let query;
            let params;
            
            if (userProfileId) {
                query = `
                    SELECT * FROM salary_entries
                    WHERE user_id = $1 AND user_profile_id = $2
                    ORDER BY date DESC
                `;
                params = [userId, userProfileId];
            } else {
                query = `
                    SELECT * FROM salary_entries
                    WHERE user_id = $1
                    ORDER BY date DESC
                `;
                params = [userId];
            }

            const result = await pool.query(query, params);
            console.log(`Found ${result.rows.length} salary entries`);
            res.json(result.rows);
        } catch (error) {
            console.error('Error fetching salary entries:', error);
            res.status(500).json({
                error: 'Failed to fetch salary entries',
                message: error.message
            });
        }
    }
}

module.exports = SalaryController; 