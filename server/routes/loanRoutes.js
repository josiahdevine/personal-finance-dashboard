const express = require('express');
const router = express.Router();
const LoanController = require('../controllers/LoanController');
const { authenticateToken } = require('../middleware/auth');

// Protect all routes
router.use(authenticateToken);

// Create a new loan
router.post('/', LoanController.createLoan);

// Record a loan payment
router.post('/:loan_id/payments', LoanController.recordPayment);

// Get loan details
router.get('/:loan_id', LoanController.getLoanDetails);

// Get all loans for a user
router.get('/', LoanController.getUserLoans);

// Get amortization schedule (calculator)
router.get('/calculate/amortization', LoanController.getAmortizationSchedule);

module.exports = router; 