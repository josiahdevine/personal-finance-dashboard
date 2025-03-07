import { Router } from 'express';
import { CashFlowPredictionController } from '../../controllers/CashFlowPredictionController';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Cash flow prediction routes
router.get('/predictions', ...CashFlowPredictionController.generatePredictions);
router.get('/recurring-transactions', CashFlowPredictionController.getRecurringTransactions);
router.get('/model-validation', ...CashFlowPredictionController.getModelValidation);

export default router; 