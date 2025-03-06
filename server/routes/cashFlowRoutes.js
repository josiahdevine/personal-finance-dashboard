import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import CashFlowPredictionController from '../controller/CashFlowPredictionController.js';

const router = express.Router();

// Get cash flow predictions
router.get('/predictions', authenticateToken, CashFlowPredictionController.generatePredictions);

// Get recurring transactions
router.get('/recurring-transactions', authenticateToken, CashFlowPredictionController.getRecurringTransactions);

// Get model validation metrics
router.get('/model-validation', authenticateToken, CashFlowPredictionController.getModelValidation);

export default router; 