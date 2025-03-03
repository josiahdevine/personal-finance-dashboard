const pool = require('../db');

class GoalController {
    static async getGoals(req, res) {
        try {
            const userId = req.user.id;

            const query = `
                SELECT 
                    g.*,
                    CASE 
                        WHEN g.target_amount = 0 THEN 0
                        ELSE ROUND((g.current_amount / g.target_amount * 100)::numeric, 2)
                    END as progress
                FROM financial_goals g
                WHERE user_id = $1
                ORDER BY target_date ASC
            `;

            const result = await pool.query(query, [userId]);
            res.json(result.rows);
        } catch (error) {
            console.error('Error fetching goals:', error);
            res.status(500).json({
                error: 'Failed to fetch goals',
                message: error.message
            });
        }
    }

    static async getGoalById(req, res) {
        try {
            const userId = req.user.id;
            const { id } = req.params;

            const query = `
                SELECT 
                    g.*,
                    CASE 
                        WHEN g.target_amount = 0 THEN 0
                        ELSE ROUND((g.current_amount / g.target_amount * 100)::numeric, 2)
                    END as progress
                FROM financial_goals g
                WHERE id = $1 AND user_id = $2
            `;

            const result = await pool.query(query, [id, userId]);

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Goal not found' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error fetching goal:', error);
            res.status(500).json({
                error: 'Failed to fetch goal',
                message: error.message
            });
        }
    }

    static async createGoal(req, res) {
        try {
            const userId = req.user.id;
            const {
                name,
                description,
                target_amount,
                target_date,
                current_amount = 0,
                category
            } = req.body;

            const query = `
                INSERT INTO financial_goals (
                    user_id,
                    name,
                    description,
                    target_amount,
                    current_amount,
                    target_date,
                    category
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *
            `;

            const result = await pool.query(query, [
                userId,
                name,
                description,
                target_amount,
                current_amount,
                target_date,
                category
            ]);

            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Error creating goal:', error);
            res.status(500).json({
                error: 'Failed to create goal',
                message: error.message
            });
        }
    }

    static async updateGoal(req, res) {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            const {
                name,
                description,
                target_amount,
                target_date,
                current_amount,
                category
            } = req.body;

            const query = `
                UPDATE financial_goals
                SET 
                    name = COALESCE($1, name),
                    description = COALESCE($2, description),
                    target_amount = COALESCE($3, target_amount),
                    target_date = COALESCE($4, target_date),
                    current_amount = COALESCE($5, current_amount),
                    category = COALESCE($6, category),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $7 AND user_id = $8
                RETURNING *
            `;

            const result = await pool.query(query, [
                name,
                description,
                target_amount,
                target_date,
                current_amount,
                category,
                id,
                userId
            ]);

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Goal not found' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error updating goal:', error);
            res.status(500).json({
                error: 'Failed to update goal',
                message: error.message
            });
        }
    }

    static async deleteGoal(req, res) {
        try {
            const userId = req.user.id;
            const { id } = req.params;

            const query = `
                DELETE FROM financial_goals
                WHERE id = $1 AND user_id = $2
                RETURNING *
            `;

            const result = await pool.query(query, [id, userId]);

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Goal not found' });
            }

            res.json({ message: 'Goal deleted successfully' });
        } catch (error) {
            console.error('Error deleting goal:', error);
            res.status(500).json({
                error: 'Failed to delete goal',
                message: error.message
            });
        }
    }

    static async updateProgress(req, res) {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            const { amount } = req.body;

            const query = `
                UPDATE financial_goals
                SET 
                    current_amount = current_amount + $1,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $2 AND user_id = $3
                RETURNING *
            `;

            const result = await pool.query(query, [amount, id, userId]);

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Goal not found' });
            }

            // Calculate progress
            const goal = result.rows[0];
            const progress = goal.target_amount === 0 ? 0 : 
                (goal.current_amount / goal.target_amount * 100).toFixed(2);

            res.json({
                ...goal,
                progress: parseFloat(progress)
            });
        } catch (error) {
            console.error('Error updating goal progress:', error);
            res.status(500).json({
                error: 'Failed to update goal progress',
                message: error.message
            });
        }
    }
}

module.exports = GoalController; 