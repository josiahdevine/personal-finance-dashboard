import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { CashFlowPredictionService } from '../services/CashFlowPredictionService';
import { ModelValidationService } from '../services/ModelValidationService';
import { validateRequest } from '../middleware/validateRequest';
import type { AuthenticatedRequest } from '../types/AuthenticatedRequest';

const generatePredictionsSchema = z.object({
    query: z.object({
        timeframeInDays: z.string().optional().transform(val => val ? parseInt(val) : undefined),
        modelType: z.enum(['time-series', 'recurring-transaction', 'hybrid']).optional(),
        includePendingTransactions: z.enum(['true', 'false']).optional().transform(val => val === 'true'),
        includeRecurringTransactions: z.enum(['true', 'false']).optional().transform(val => val === 'true'),
        confidenceLevel: z.string().optional().transform(val => val ? parseFloat(val) : undefined)
    })
});

const validateModelSchema = z.object({
    query: z.object({
        modelType: z.enum(['time-series', 'recurring-transaction', 'hybrid']).optional(),
        k: z.string().optional().transform(val => val ? parseInt(val) : undefined),
        timeframeInDays: z.string().optional().transform(val => val ? parseInt(val) : undefined)
    })
});

type GeneratePredictionsQuery = z.infer<typeof generatePredictionsSchema>['query'];
type ValidateModelQuery = z.infer<typeof validateModelSchema>['query'];

export class CashFlowPredictionController {
    private static cashFlowPredictionService = new CashFlowPredictionService();
    private static modelValidationService = new ModelValidationService();

    /**
     * Generate cash flow predictions
     */
    public static generatePredictions = [
        validateRequest(generatePredictionsSchema),
        async (
            req: AuthenticatedRequest<any, any, any, GeneratePredictionsQuery>,
            res: Response,
            next: NextFunction
        ) => {
            try {
                if (!req.user) {
                    res.status(401).json({
                        success: false,
                        error: 'User not authenticated'
                    });
                    return;
                }

                const userId = req.user.id;
                const config = req.query;

                const predictions = await this.cashFlowPredictionService.generatePredictions(
                    userId,
                    {
                        timeframeInDays: config.timeframeInDays ?? 90,
                        modelType: config.modelType ?? 'hybrid',
                        includePendingTransactions: config.includePendingTransactions ?? true,
                        includeRecurringTransactions: config.includeRecurringTransactions ?? true,
                        confidenceLevel: config.confidenceLevel ?? 0.95
                    }
                );

                res.json(predictions);
            } catch (error) {
                next(error);
            }
        }
    ];

    /**
     * Get recurring transactions
     */
    public static getRecurringTransactions = async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ) => {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'User not authenticated'
                });
                return;
            }

            const userId = req.user.id;
            const recurringTransactions = await this.cashFlowPredictionService.getRecurringTransactions(userId);
            res.json(recurringTransactions);
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get model validation metrics
     */
    public static getModelValidation = [
        validateRequest(validateModelSchema),
        async (
            req: AuthenticatedRequest<any, any, any, ValidateModelQuery>,
            res: Response,
            next: NextFunction
        ) => {
            try {
                if (!req.user) {
                    res.status(401).json({
                        success: false,
                        error: 'User not authenticated'
                    });
                    return;
                }

                const userId = req.user.id;
                const config = req.query;

                // Get historical transactions for validation
                const transactions = await this.cashFlowPredictionService.getHistoricalTransactions(userId);

                // Perform cross-validation
                const metrics = await this.modelValidationService.performCrossValidation(
                    userId,
                    transactions,
                    {
                        modelType: config.modelType ?? 'hybrid',
                        timeframeInDays: config.timeframeInDays ?? 90,
                        includePendingTransactions: true,
                        includeRecurringTransactions: true,
                        confidenceLevel: 0.95
                    },
                    config.k ?? 5
                );

                // Save validation metrics
                await this.modelValidationService.saveMetrics(
                    userId,
                    config.modelType ?? 'hybrid',
                    metrics,
                    transactions[0].date,
                    transactions[transactions.length - 1].date
                );

                res.json({
                    modelType: config.modelType ?? 'hybrid',
                    metrics,
                    validationPeriod: {
                        startDate: transactions[0].date,
                        endDate: transactions[transactions.length - 1].date
                    }
                });
            } catch (error) {
                next(error);
            }
        }
    ];
} 