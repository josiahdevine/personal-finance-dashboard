import { Router } from 'express';
import { CashFlowPredictionController } from '../controllers/CashFlowPredictionController';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// Generate predictions
router.get(
  '/predictions',
  authenticate,
  CashFlowPredictionController.generatePredictions
);

// Get recurring transactions
router.get(
  '/recurring-transactions',
  authenticate,
  CashFlowPredictionController.getRecurringTransactions
);

// Get model validation metrics
router.get(
  '/model-validation',
  authenticate,
  CashFlowPredictionController.getModelValidation
);

export default router; 