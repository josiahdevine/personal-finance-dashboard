import { db } from '../db';
import { PredictionModelMetrics, ModelType } from '../types/CashFlowPrediction';

export class PredictionModelMetricsRepository {
    /**
     * Save model metrics
     */
    async saveMetrics(metrics: Omit<PredictionModelMetrics, 'id' | 'createdAt'>): Promise<PredictionModelMetrics> {
        const query = `
            INSERT INTO prediction_model_metrics (
                user_id, model_type, accuracy, mean_absolute_error,
                mean_squared_error, root_mean_squared_error,
                validation_start_date, validation_end_date
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;

        const values = [
            metrics.userId,
            metrics.modelType,
            metrics.accuracy,
            metrics.meanAbsoluteError,
            metrics.meanSquaredError,
            metrics.rootMeanSquaredError,
            metrics.validationStartDate,
            metrics.validationEndDate
        ];

        const result = await db.query(query, values);
        return this.mapRowToMetrics(result.rows[0]);
    }

    /**
     * Get latest metrics for a model type
     */
    async getLatestMetrics(userId: string, modelType: ModelType): Promise<PredictionModelMetrics | null> {
        const query = `
            SELECT *
            FROM prediction_model_metrics
            WHERE user_id = $1
            AND model_type = $2
            ORDER BY created_at DESC
            LIMIT 1
        `;

        const result = await db.query(query, [userId, modelType]);
        
        if (result.rows.length === 0) {
            return null;
        }

        return this.mapRowToMetrics(result.rows[0]);
    }

    /**
     * Get metrics history for a model type
     */
    async getMetricsHistory(
        userId: string,
        modelType: ModelType,
        limit: number = 10
    ): Promise<PredictionModelMetrics[]> {
        const query = `
            SELECT *
            FROM prediction_model_metrics
            WHERE user_id = $1
            AND model_type = $2
            ORDER BY created_at DESC
            LIMIT $3
        `;

        const result = await db.query(query, [userId, modelType, limit]);
        return result.rows.map(this.mapRowToMetrics);
    }

    /**
     * Get average metrics across all users for a model type
     */
    async getAverageMetrics(modelType: ModelType): Promise<{
        avgAccuracy: number;
        avgMeanAbsoluteError: number;
        avgMeanSquaredError: number;
        avgRootMeanSquaredError: number;
    }> {
        const query = `
            SELECT
                AVG(accuracy) as avg_accuracy,
                AVG(mean_absolute_error) as avg_mae,
                AVG(mean_squared_error) as avg_mse,
                AVG(root_mean_squared_error) as avg_rmse
            FROM prediction_model_metrics
            WHERE model_type = $1
            AND created_at >= NOW() - INTERVAL '30 days'
        `;

        const result = await db.query(query, [modelType]);
        const row = result.rows[0];

        return {
            avgAccuracy: parseFloat(row.avg_accuracy) || 0,
            avgMeanAbsoluteError: parseFloat(row.avg_mae) || 0,
            avgMeanSquaredError: parseFloat(row.avg_mse) || 0,
            avgRootMeanSquaredError: parseFloat(row.avg_rmse) || 0
        };
    }

    /**
     * Map database row to PredictionModelMetrics type
     */
    private mapRowToMetrics(row: any): PredictionModelMetrics {
        return {
            id: row.id,
            userId: row.user_id,
            modelType: row.model_type as ModelType,
            accuracy: parseFloat(row.accuracy),
            meanAbsoluteError: parseFloat(row.mean_absolute_error),
            meanSquaredError: parseFloat(row.mean_squared_error),
            rootMeanSquaredError: parseFloat(row.root_mean_squared_error),
            validationStartDate: row.validation_start_date,
            validationEndDate: row.validation_end_date,
            createdAt: row.created_at
        };
    }
} 