const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const TransactionController = require('../controllers/TransactionController');

// Protect all routes
router.use(authenticateToken);

// Get spending summary
router.get('/spending-summary', TransactionController.getSpendingSummary);

// Get all transactions
router.get('/', TransactionController.getTransactions);

// Get transaction by ID
router.get('/:id', TransactionController.getTransactionById);

// Add manual transaction
router.post('/', TransactionController.addTransaction);

// Update transaction
router.put('/:id', TransactionController.updateTransaction);

// Delete transaction
router.delete('/:id', TransactionController.deleteTransaction);

module.exports = router; 