import pool from '../db.js';

class CashFlowPredictionController {
    static async generatePredictions(req, res) {
        try {
            const userId = req.user.id;
            const { timeframe = 30 } = req.query; // Default to 30 days

            // Get user's recurring transactions
            const recurringQuery = `
                SELECT amount, category, frequency, next_date
                FROM recurring_transactions
                WHERE user_id = $1 AND is_active = true
            `;
            const recurringResult = await pool.query(recurringQuery, [userId]);
            const recurringTransactions = recurringResult.rows;

            // Get recent transactions for pattern analysis
            const recentQuery = `
                SELECT amount, category, date
                FROM transactions
                WHERE user_id = $1
                AND date >= NOW() - INTERVAL '90 days'
                ORDER BY date DESC
            `;
            const recentResult = await pool.query(recentQuery, [userId]);
            const recentTransactions = recentResult.rows;

            // Calculate predictions based on recurring transactions and patterns
            const predictions = this.calculatePredictions(
                recurringTransactions,
                recentTransactions,
                timeframe
            );

            res.json({
                success: true,
                predictions,
                timeframe
            });
        } catch (error) {
            console.error('Error generating predictions:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to generate cash flow predictions'
            });
        }
    }

    static async getRecurringTransactions(req, res) {
        try {
            const userId = req.user.id;
            
            const query = `
                SELECT id, amount, category, frequency, next_date, description
                FROM recurring_transactions
                WHERE user_id = $1 AND is_active = true
                ORDER BY next_date ASC
            `;
            
            const result = await pool.query(query, [userId]);
            
            res.json({
                success: true,
                recurringTransactions: result.rows
            });
        } catch (error) {
            console.error('Error fetching recurring transactions:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch recurring transactions'
            });
        }
    }

    static async getModelValidation(req, res) {
        try {
            const userId = req.user.id;
            
            // Get predictions from 30 days ago
            const historicalPredictions = await this.getHistoricalPredictions(userId);
            
            // Get actual transactions for the same period
            const actualTransactions = await this.getActualTransactions(userId);
            
            // Calculate accuracy metrics
            const validationMetrics = this.calculateValidationMetrics(
                historicalPredictions,
                actualTransactions
            );
            
            res.json({
                success: true,
                validationMetrics
            });
        } catch (error) {
            console.error('Error validating model:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to validate prediction model'
            });
        }
    }

    static calculatePredictions(recurringTransactions, recentTransactions, timeframe) {
        // Initialize daily predictions array
        const predictions = Array(timeframe).fill().map((_, i) => ({
            date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
            inflow: 0,
            outflow: 0,
            balance: 0,
            transactions: []
        }));

        // Add recurring transactions to predictions
        for (const recurring of recurringTransactions) {
            const { amount, category, frequency, next_date } = recurring;
            let currentDate = new Date(next_date);

            while (currentDate <= predictions[predictions.length - 1].date) {
                const dayIndex = Math.floor(
                    (currentDate - predictions[0].date) / (24 * 60 * 60 * 1000)
                );

                if (dayIndex >= 0 && dayIndex < predictions.length) {
                    if (amount > 0) {
                        predictions[dayIndex].inflow += amount;
                    } else {
                        predictions[dayIndex].outflow += Math.abs(amount);
                    }

                    predictions[dayIndex].transactions.push({
                        amount,
                        category,
                        type: 'recurring'
                    });
                }

                // Update date based on frequency
                switch (frequency.toLowerCase()) {
                    case 'daily':
                        currentDate.setDate(currentDate.getDate() + 1);
                        break;
                    case 'weekly':
                        currentDate.setDate(currentDate.getDate() + 7);
                        break;
                    case 'monthly':
                        currentDate.setMonth(currentDate.getMonth() + 1);
                        break;
                    default:
                        currentDate.setFullYear(currentDate.getFullYear() + 1);
                }
            }
        }

        // Calculate running balance
        let balance = 0;
        for (const prediction of predictions) {
            balance += prediction.inflow - prediction.outflow;
            prediction.balance = balance;
        }

        return predictions;
    }

    static async getHistoricalPredictions(userId) {
        const query = `
            SELECT prediction_date, predicted_amount, category
            FROM cash_flow_predictions
            WHERE user_id = $1
            AND prediction_date >= NOW() - INTERVAL '30 days'
            AND prediction_date < NOW()
        `;
        
        const result = await pool.query(query, [userId]);
        return result.rows;
    }

    static async getActualTransactions(userId) {
        const query = `
            SELECT date, amount, category
            FROM transactions
            WHERE user_id = $1
            AND date >= NOW() - INTERVAL '30 days'
            AND date < NOW()
        `;
        
        const result = await pool.query(query, [userId]);
        return result.rows;
    }

    static calculateValidationMetrics(predictions, actuals) {
        let totalError = 0;
        let totalPredictions = 0;
        let correctDirections = 0;

        // Group transactions by date
        const actualsByDate = this.groupTransactionsByDate(actuals);
        const predictionsByDate = this.groupTransactionsByDate(predictions);

        // Calculate metrics
        for (const [date, predicted] of Object.entries(predictionsByDate)) {
            const actual = actualsByDate[date] || { amount: 0 };
            
            totalError += Math.abs(predicted.amount - actual.amount);
            totalPredictions++;

            if ((predicted.amount >= 0 && actual.amount >= 0) ||
                (predicted.amount < 0 && actual.amount < 0)) {
                correctDirections++;
            }
        }

        return {
            meanAbsoluteError: totalError / totalPredictions,
            directionAccuracy: (correctDirections / totalPredictions) * 100,
            totalPredictions
        };
    }

    static groupTransactionsByDate(transactions) {
        return transactions.reduce((acc, transaction) => {
            const date = new Date(transaction.date).toISOString().split('T')[0];
            if (!acc[date]) {
                acc[date] = { amount: 0 };
            }
            acc[date].amount += transaction.amount;
            return acc;
        }, {});
    }
}

export default CashFlowPredictionController; 