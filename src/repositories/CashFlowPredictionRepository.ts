import { query } from '../db';
import { CashFlowPrediction, ModelType, TimeframeType } from '../types/CashFlowPrediction';

export class CashFlowPredictionRepository {
    /**
     * Save a batch of predictions
     */
    async savePredictions(predictions: Array<Omit<CashFlowPrediction, 'id' | 'createdAt'>>): Promise<CashFlowPrediction[]> {
        const sqlQuery = `
            INSERT INTO cash_flow_predictions (
                user_id,
                prediction_date,
                amount,
                confidence_low,
                confidence_high,
                model_type,
                timeframe
            )
            VALUES
            ${predictions.map((_, i) => 
                `($${i * 7 + 1}, $${i * 7 + 2}, $${i * 7 + 3}, $${i * 7 + 4}, $${i * 7 + 5}, $${i * 7 + 6}, $${i * 7 + 7})`
            ).join(', ')}
            RETURNING *
        `;

        const values = predictions.flatMap(p => [
            p.userId,
            p.predictionDate,
            p.amount,
            p.confidenceLow,
            p.confidenceHigh,
            p.modelType,
            p.timeframe
        ]);

        const result = await query(sqlQuery, values);
        return result.map(this.mapRowToPrediction);
    }

    /**
     * Find predictions by date range
     */
    async findByDateRange(
        userId: string,
        startDate: string,
        endDate: string,
        timeframe: TimeframeType = 'daily'
    ): Promise<CashFlowPrediction[]> {
        const sqlQuery = `
            SELECT * FROM cash_flow_predictions
            WHERE user_id = $1
            AND prediction_date BETWEEN $2 AND $3
            AND timeframe = $4
            ORDER BY prediction_date ASC
        `;

        const result = await query(sqlQuery, [userId, startDate, endDate, timeframe]);
        return result.map(this.mapRowToPrediction);
    }

    /**
     * Delete predictions older than a certain date
     */
    async deleteOldPredictions(userId: string, beforeDate: string): Promise<void> {
        const sqlQuery = `
            DELETE FROM cash_flow_predictions
            WHERE user_id = $1
            AND prediction_date < $2
        `;

        await query(sqlQuery, [userId, beforeDate]);
    }

    /**
     * Get the latest predictions for a user
     */
    async getLatestPredictions(
        userId: string,
        modelType: ModelType,
        timeframe: TimeframeType,
        limit = 30
    ): Promise<CashFlowPrediction[]> {
        const sqlQuery = `
            SELECT * FROM cash_flow_predictions
            WHERE user_id = $1
            AND model_type = $2
            AND timeframe = $3
            ORDER BY prediction_date DESC
            LIMIT $4
        `;

        const result = await query(sqlQuery, [userId, modelType, timeframe, limit]);
        return result.map(this.mapRowToPrediction);
    }

    /**
     * Map a database row to a CashFlowPrediction object
     */
    private mapRowToPrediction(row: any): CashFlowPrediction {
        return {
            id: row.id,
            userId: row.user_id,
            predictionDate: row.prediction_date,
            amount: parseFloat(row.amount),
            confidenceLow: parseFloat(row.confidence_low),
            confidenceHigh: parseFloat(row.confidence_high),
            modelType: row.model_type as ModelType,
            timeframe: row.timeframe as TimeframeType,
            createdAt: row.created_at
        };
    }
} 