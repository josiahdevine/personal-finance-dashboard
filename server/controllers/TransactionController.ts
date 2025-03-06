import { Request, Response, NextFunction } from 'express';
import { transactionService } from '../services/TransactionService';
import { ApiError } from '../utils/ApiError';
import { validate } from '../middleware/validation';
import { z } from 'zod';

// Validation schemas
const getTransactionsSchema = z.object({
  query: z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
    category: z.string().optional(),
    accountId: z.string().optional(),
    limit: z.string().transform(Number).pipe(z.number().positive()).optional(),
    offset: z.string().transform(Number).pipe(z.number().nonnegative()).optional(),
  }),
});

export class TransactionController {
  /**
   * Get transactions for the authenticated user
   */
  public static getTransactions = [
    validate(getTransactionsSchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { startDate, endDate, category, accountId, limit = 100, offset = 0 } = req.query;
        const userId = req.user.id;
        
        const result = await transactionService.getTransactions({
          userId,
          startDate: startDate as string,
          endDate: endDate as string,
          category: category as string | undefined,
          accountId: accountId as string | undefined,
          limit: Number(limit),
          offset: Number(offset),
        });
        
        res.json(result);
      } catch (error) {
        next(error);
      }
    },
  ];
  
  /**
   * Get transaction by ID
   */
  public static getTransactionById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const transaction = await transactionService.getTransactionById(id, userId);
      
      if (!transaction) {
        throw new ApiError(404, 'Transaction not found');
      }
      
      res.json(transaction);
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Update transaction category
   */
  public static updateTransactionCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { category } = req.body;
      const userId = req.user.id;
      
      const updatedTransaction = await transactionService.updateTransactionCategory(id, category, userId);
      
      res.json(updatedTransaction);
    } catch (error) {
      next(error);
    }
  };
} 