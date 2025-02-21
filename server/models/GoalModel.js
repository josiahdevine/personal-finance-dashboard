const db = require('../db');

class GoalModel {
    static async createGoal(userId, goal) {
        const {
            name,
            target_amount,
            current_amount,
            target_date,
            category,
            description
        } = goal;

        const query = `
            INSERT INTO financial_goals (
                user_id, name, target_amount, current_amount,
                target_date, category, description
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        
        const result = await db.query(query, [
            userId, name, target_amount, current_amount,
            target_date, category, description
        ]);
        return result.rows[0];
    }

    static async getUserGoals(userId) {
        const query = `
            SELECT 
                id,
                name,
                target_amount,
                current_amount,
                target_date,
                category,
                description,
                ROUND((current_amount::numeric / target_amount::numeric * 100), 1) as progress
            FROM financial_goals
            WHERE user_id = $1
            ORDER BY target_date ASC
        `;

        const result = await db.query(query, [userId]);
        return result.rows;
    }

    static async updateGoalProgress(goalId, userId, currentAmount) {
        const query = `
            UPDATE financial_goals
            SET current_amount = $1,
                last_updated = CURRENT_TIMESTAMP
            WHERE id = $2 AND user_id = $3
            RETURNING *
        `;

        const result = await db.query(query, [currentAmount, goalId, userId]);
        return result.rows[0];
    }

    static async deleteGoal(goalId, userId) {
        const query = `
            DELETE FROM financial_goals
            WHERE id = $1 AND user_id = $2
            RETURNING id
        `;

        const result = await db.query(query, [goalId, userId]);
        return result.rows[0];
    }

    static async getGoalProgress(userId) {
        const query = `
            SELECT 
                category,
                COUNT(*) as total_goals,
                SUM(CASE WHEN current_amount >= target_amount THEN 1 ELSE 0 END) as completed_goals,
                ROUND(AVG(current_amount::numeric / target_amount::numeric * 100), 1) as avg_progress
            FROM financial_goals
            WHERE user_id = $1
            GROUP BY category
        `;

        const result = await db.query(query, [userId]);
        return result.rows;
    }
}

module.exports = GoalModel; 