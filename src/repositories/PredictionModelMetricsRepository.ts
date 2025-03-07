import { query } from '../db';
import { PredictionModelMetrics, ModelType } from '../types/CashFlowPrediction';

export class PredictionModelMetricsRepository {
    /**
     * Save model metrics
     */
    async saveMetrics(metrics: Omit<PredictionModelMetrics, 'id' | 'createdAt'>): Promise<PredictionModelMetrics> {
        const columns = Object.keys(metrics).join(', ');
        const placeholders = Object.keys(metrics).map((_, i) => `$${i + 1}`).join(', ');
        
        const sqlQuery = `
            INSERT INTO prediction_model_metrics (${columns})
            VALUES (${placeholders})
            RETURNING *
        `;

        const values = Object.values(metrics);
        const result = await query(sqlQuery, values);
        return this.mapRowToMetrics(result[0]);
    }

    /**
     * Get the latest metrics for a model
     */
    async getLatestMetrics(userId: string, modelType: ModelType): Promise<PredictionModelMetrics | null> {
        const sqlQuery = `
            SELECT * FROM prediction_model_metrics
            WHERE user_id = $1 AND model_type = $2
            ORDER BY created_at DESC
            LIMIT 1
        `;

        const result = await query(sqlQuery, [userId, modelType]);
        
        if (result.length === 0) {
            return null;
        }
        
        return this.mapRowToMetrics(result[0]);
    }

    /**
     * Get metrics history for a model
     */
    async getMetricsHistory(userId: string, modelType: ModelType, limit = 10): Promise<PredictionModelMetrics[]> {
        const sqlQuery = `
            SELECT * FROM prediction_model_metrics
            WHERE user_id = $1 AND model_type = $2
            ORDER BY created_at DESC
            LIMIT $3
        `;

        const result = await query(sqlQuery, [userId, modelType, limit]);
        return result.map(this.mapRowToMetrics);
    }

    /**
     * Get average metrics across all users for a model type
     */
    async getAverageMetrics(modelType: ModelType): Promise<{
        accuracy: number;
        meanAbsoluteError: number;
        meanSquaredError: number;
        rootMeanSquaredError: number;
        sampleCount: number;
    }> {
        const sqlQuery = `
            SELECT 
                AVG(accuracy) as accuracy,
                AVG(mean_absolute_error) as mean_absolute_error,
                AVG(mean_squared_error) as mean_squared_error,
                AVG(root_mean_squared_error) as root_mean_squared_error,
                COUNT(*) as sample_count
            FROM prediction_model_metrics
            WHERE model_type = $1
            AND created_at > NOW() - INTERVAL '30 days'
        `;

        const result = await query(sqlQuery, [modelType]);
        const row = result[0];

        return {
            accuracy: parseFloat(row.accuracy || '0'),
            meanAbsoluteError: parseFloat(row.mean_absolute_error || '0'),
            meanSquaredError: parseFloat(row.mean_squared_error || '0'),
            rootMeanSquaredError: parseFloat(row.root_mean_squared_error || '0'),
            sampleCount: parseInt(row.sample_count || '0')
        };
    }

    /**
     * Map a database row to a PredictionModelMetrics object
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