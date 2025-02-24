const LoanModel = require('../models/LoanModel');

class LoanController {
    // Create a new loan
    static async createLoan(req, res) {
        try {
            const { manual_account_id, ...loanData } = req.body;
            
            // Validate required fields
            const requiredFields = ['principal_amount', 'interest_rate', 'loan_term_months', 'start_date'];
            const missingFields = requiredFields.filter(field => !loanData[field]);
            
            if (missingFields.length > 0) {
                return res.status(400).json({
                    message: 'Missing required fields',
                    missingFields
                });
            }

            const loan = await LoanModel.createLoan(manual_account_id, loanData);
            res.status(201).json(loan);
        } catch (error) {
            console.error('Error creating loan:', error);
            res.status(500).json({
                message: 'Error creating loan',
                error: error.message
            });
        }
    }

    // Record a loan payment
    static async recordPayment(req, res) {
        try {
            const { loan_id } = req.params;
            const paymentData = req.body;

            // Validate required fields
            const requiredFields = ['payment_date', 'payment_amount'];
            const missingFields = requiredFields.filter(field => !paymentData[field]);
            
            if (missingFields.length > 0) {
                return res.status(400).json({
                    message: 'Missing required fields',
                    missingFields
                });
            }

            const payment = await LoanModel.recordPayment(loan_id, paymentData);
            res.json(payment);
        } catch (error) {
            console.error('Error recording loan payment:', error);
            res.status(500).json({
                message: 'Error recording loan payment',
                error: error.message
            });
        }
    }

    // Get loan details
    static async getLoanDetails(req, res) {
        try {
            const { loan_id } = req.params;
            const loan = await LoanModel.getLoanDetails(loan_id);
            
            if (!loan) {
                return res.status(404).json({
                    message: 'Loan not found'
                });
            }

            res.json(loan);
        } catch (error) {
            console.error('Error fetching loan details:', error);
            res.status(500).json({
                message: 'Error fetching loan details',
                error: error.message
            });
        }
    }

    // Get all loans for a user
    static async getUserLoans(req, res) {
        try {
            const userId = req.user.id;
            const loans = await LoanModel.getUserLoans(userId);
            res.json(loans);
        } catch (error) {
            console.error('Error fetching user loans:', error);
            res.status(500).json({
                message: 'Error fetching user loans',
                error: error.message
            });
        }
    }

    // Get amortization schedule
    static async getAmortizationSchedule(req, res) {
        try {
            const { principal, rate, term, start_date } = req.query;
            
            if (!principal || !rate || !term || !start_date) {
                return res.status(400).json({
                    message: 'Missing required parameters'
                });
            }

            const schedule = LoanModel.calculateAmortizationSchedule(
                parseFloat(principal),
                parseFloat(rate),
                parseInt(term),
                new Date(start_date)
            );

            res.json(schedule);
        } catch (error) {
            console.error('Error calculating amortization schedule:', error);
            res.status(500).json({
                message: 'Error calculating amortization schedule',
                error: error.message
            });
        }
    }
}

module.exports = LoanController; 