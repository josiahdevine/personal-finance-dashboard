const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const TransactionModel = require('../models/TransactionModel');
const multer = require('multer');
const csv = require('csv-parse');
const upload = multer({ storage: multer.memoryStorage() });

// Protect all routes
router.use(authenticateToken);

// Get spending summary
router.get('/spending-summary', async (req, res) => {
    try {
        const userId = req.user.id;
        const { startDate = new Date(new Date().setMonth(new Date().getMonth() - 1)), 
                endDate = new Date() } = req.query;
        
        const summary = await TransactionModel.getSpendingSummary(userId, startDate, endDate);
        res.json(summary);
    } catch (error) {
        console.error('Error getting spending summary:', error);
        res.status(500).json({ error: 'Failed to get spending summary' });
    }
});

// Get transactions by category
router.get('/by-category/:category', async (req, res) => {
    try {
        const userId = req.user.id;
        const { category } = req.params;
        const { startDate, endDate } = req.query;
        
        const transactions = await TransactionModel.getTransactionsByCategory(
            userId, category, startDate, endDate
        );
        res.json(transactions);
    } catch (error) {
        console.error('Error getting transactions by category:', error);
        res.status(500).json({ error: 'Failed to get transactions' });
    }
});

// Update transaction category
router.put('/:transactionId/category', async (req, res) => {
    try {
        const userId = req.user.id;
        const { transactionId } = req.params;
        const { category } = req.body;
        
        const updated = await TransactionModel.updateTransactionCategory(
            transactionId, userId, category
        );
        res.json(updated);
    } catch (error) {
        console.error('Error updating transaction category:', error);
        res.status(500).json({ error: 'Failed to update category' });
    }
});

// Import transactions from CSV
router.post('/import', upload.single('file'), async (req, res) => {
    try {
        const userId = req.user.id;
        const fileBuffer = req.file.buffer.toString();
        
        const parser = csv.parse(fileBuffer, {
            columns: true,
            skip_empty_lines: true
        });

        const transactions = [];
        const existingTransactions = new Set();

        // Get existing transactions for deduplication
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 3); // Look back 3 months
        const existing = await TransactionModel.getTransactionsByDateRange(
            userId, startDate, new Date()
        );
        
        existing.forEach(t => {
            const key = `${t.date}-${t.amount}-${t.description}`;
            existingTransactions.add(key);
        });

        // Parse CSV and check for duplicates
        for await (const record of parser) {
            const transaction = {
                date: new Date(record.date),
                amount: parseFloat(record.amount),
                description: record.description,
                category: record.category || 'Uncategorized',
                accountId: record.account_id || 'manual',
                source: 'manual'
            };

            const key = `${transaction.date}-${transaction.amount}-${transaction.description}`;
            if (!existingTransactions.has(key)) {
                transactions.push(transaction);
                existingTransactions.add(key);
            }
        }

        if (transactions.length > 0) {
            await TransactionModel.bulkAddTransactions(userId, transactions);
        }

        res.json({ 
            message: 'Transactions imported successfully',
            imported: transactions.length
        });
    } catch (error) {
        console.error('Error importing transactions:', error);
        res.status(500).json({ error: 'Failed to import transactions' });
    }
});

module.exports = router; 