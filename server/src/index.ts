import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { setupSwagger } from '../utils/swagger';
import { TransactionController } from '../controllers/TransactionController';
import { auth } from '../middleware/firebaseAuth';

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Setup Swagger documentation
setupSwagger(app);

// Transaction routes - protected by Firebase Auth
app.get('/api/transactions', auth, TransactionController.getTransactions);
app.get('/api/transactions/:id', auth, TransactionController.getTransactionById);
app.patch('/api/transactions/:id/category', auth, TransactionController.updateTransactionCategory);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred',
      details: err.details,
      requestId: req.headers['x-request-id'] || 'unknown',
    },
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API documentation available at http://localhost:${PORT}/api-docs`);
}); 