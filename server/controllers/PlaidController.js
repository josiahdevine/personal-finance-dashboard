const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
const pool = require('../db');

class PlaidController {
    // ... existing methods ...

    static async getBalanceHistory(req, res) {
        try {
            const userId = req.user.id;
            const days = 30; // Default to 30 days of history

            // Get balance history from database
            const query = `
                SELECT 
                    date_trunc('day', recorded_at) as date,
                    SUM(current_balance) as total_balance
                FROM account_balances ab
                JOIN plaid_accounts pa ON ab.account_id = pa.id
                WHERE pa.user_id = $1
                AND recorded_at >= NOW() - INTERVAL '${days} days'
                GROUP BY date_trunc('day', recorded_at)
                ORDER BY date_trunc('day', recorded_at)
            `;

            const result = await pool.query(query, [userId]);

            // Format data for Chart.js
            const labels = result.rows.map(row => new Date(row.date).toLocaleDateString());
            const data = result.rows.map(row => parseFloat(row.total_balance));

            const chartData = {
                labels,
                datasets: [{
                    label: 'Net Worth',
                    data,
                    fill: false,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            };

            res.json(chartData);
        } catch (error) {
            console.error('Error fetching balance history:', error);
            res.status(500).json({
                error: 'Failed to fetch balance history',
                message: error.message
            });
        }
    }
}

module.exports = PlaidController; 