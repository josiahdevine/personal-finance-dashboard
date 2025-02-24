const InvestmentModel = require('../models/InvestmentModel');

class InvestmentController {
    // Create a new investment
    static async createInvestment(req, res) {
        try {
            const { manual_account_id, ...investmentData } = req.body;
            
            // Validate required fields
            const requiredFields = ['total_value', 'purchase_date'];
            const missingFields = requiredFields.filter(field => !investmentData[field]);
            
            if (missingFields.length > 0) {
                return res.status(400).json({
                    message: 'Missing required fields',
                    missingFields
                });
            }

            const investment = await InvestmentModel.createInvestment(manual_account_id, investmentData);
            res.status(201).json(investment);
        } catch (error) {
            console.error('Error creating investment:', error);
            res.status(500).json({
                message: 'Error creating investment',
                error: error.message
            });
        }
    }

    // Update investment quantity
    static async updateQuantity(req, res) {
        try {
            const { investment_id } = req.params;
            const { quantity, reason } = req.body;

            if (!quantity) {
                return res.status(400).json({
                    message: 'Quantity is required'
                });
            }

            const investment = await InvestmentModel.updateQuantity(
                investment_id,
                parseFloat(quantity),
                reason
            );

            res.json(investment);
        } catch (error) {
            console.error('Error updating investment quantity:', error);
            res.status(500).json({
                message: 'Error updating investment quantity',
                error: error.message
            });
        }
    }

    // Get investment details
    static async getInvestmentDetails(req, res) {
        try {
            const { investment_id } = req.params;
            const investment = await InvestmentModel.getInvestmentDetails(investment_id);
            
            if (!investment) {
                return res.status(404).json({
                    message: 'Investment not found'
                });
            }

            res.json(investment);
        } catch (error) {
            console.error('Error fetching investment details:', error);
            res.status(500).json({
                message: 'Error fetching investment details',
                error: error.message
            });
        }
    }

    // Get all investments for a user
    static async getUserInvestments(req, res) {
        try {
            const userId = req.user.id;
            const investments = await InvestmentModel.getUserInvestments(userId);
            res.json(investments);
        } catch (error) {
            console.error('Error fetching user investments:', error);
            res.status(500).json({
                message: 'Error fetching user investments',
                error: error.message
            });
        }
    }

    // Calculate investment performance
    static async getPerformance(req, res) {
        try {
            const { investment_id } = req.params;
            const performance = await InvestmentModel.calculatePerformance(investment_id);
            
            if (!performance) {
                return res.status(404).json({
                    message: 'Investment not found'
                });
            }

            res.json(performance);
        } catch (error) {
            console.error('Error calculating investment performance:', error);
            res.status(500).json({
                message: 'Error calculating investment performance',
                error: error.message
            });
        }
    }

    // Update current prices for all investments
    static async updatePrices(req, res) {
        try {
            const userId = req.user.id;
            const investments = await InvestmentModel.getUserInvestments(userId);
            const updates = [];

            for (const investment of investments) {
                if (investment.symbol) {
                    try {
                        const price = await InvestmentModel.fetchCurrentPrice(investment.symbol);
                        await InvestmentModel.recordPrice(investment.id, price);
                        updates.push({
                            symbol: investment.symbol,
                            price,
                            status: 'success'
                        });
                    } catch (error) {
                        updates.push({
                            symbol: investment.symbol,
                            error: error.message,
                            status: 'error'
                        });
                    }
                }
            }

            res.json({
                message: 'Price update complete',
                updates
            });
        } catch (error) {
            console.error('Error updating investment prices:', error);
            res.status(500).json({
                message: 'Error updating investment prices',
                error: error.message
            });
        }
    }

    // Get price history for an investment
    static async getPriceHistory(req, res) {
        try {
            const { investment_id } = req.params;
            const { start_date, end_date } = req.query;
            
            const investment = await InvestmentModel.getInvestmentDetails(investment_id);
            
            if (!investment) {
                return res.status(404).json({
                    message: 'Investment not found'
                });
            }

            // Filter price history based on date range if provided
            let priceHistory = investment.price_history || [];
            if (start_date) {
                priceHistory = priceHistory.filter(p => new Date(p.date) >= new Date(start_date));
            }
            if (end_date) {
                priceHistory = priceHistory.filter(p => new Date(p.date) <= new Date(end_date));
            }

            res.json({
                investment_id,
                symbol: investment.symbol,
                price_history: priceHistory
            });
        } catch (error) {
            console.error('Error fetching price history:', error);
            res.status(500).json({
                message: 'Error fetching price history',
                error: error.message
            });
        }
    }
}

module.exports = InvestmentController; 