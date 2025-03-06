import { db } from '../db';
import { CashFlowPrediction, ModelType, TimeframeType } from '../types/CashFlowPrediction';

export class CashFlowPredictionRepository {
    /**
     * Save a batch of predictions
     */
    async savePredictions(predictions: Array<Omit<CashFlowPrediction, 'id' | 'createdAt'>>): Promise<CashFlowPrediction[]> {
        const query = `
            INSERT INTO cash_flow_predictions (
                user_id, prediction_date, amount, confidence_low,
                confidence_high, model_type, timeframe
            )
            SELECT * FROM UNNEST (
                $1::uuid[], $2::date[], $3::decimal[], $4::decimal[],
                $5::decimal[], $6::varchar[], $7::varchar[]
            )
            RETURNING *
        `;

        const values = [
            predictions.map(p => p.userId),
            predictions.map(p => p.predictionDate),
            predictions.map(p => p.amount),
            predictions.map(p => p.confidenceLow),
            predictions.map(p => p.confidenceHigh),
            predictions.map(p => p.modelType),
            predictions.map(p => p.timeframe)
        ];

        const result = await db.query(query, values);
        return result.rows.map(this.mapRowToPrediction);
    }

    /**
     * Get predictions for a user within a date range
     */
    async findByDateRange(
        userId: string,
        startDate: string,
        endDate: string,
        timeframe: TimeframeType = 'daily'
    ): Promise<CashFlowPrediction[]> {
        const query = `
            SELECT *
            FROM cash_flow_predictions
            WHERE user_id = $1
            AND prediction_date BETWEEN $2 AND $3
            AND timeframe = $4
            ORDER BY prediction_date ASC
        `;

        const result = await db.query(query, [userId, startDate, endDate, timeframe]);
        return result.rows.map(this.mapRowToPrediction);
    }

    /**
     * Delete old predictions for a user
     */
    async deleteOldPredictions(userId: string, beforeDate: string): Promise<void> {
        const query = `
            DELETE FROM cash_flow_predictions
            WHERE user_id = $1
            AND prediction_date < $2
        `;

        await db.query(query, [userId, beforeDate]);
    }

    /**
     * Get latest predictions for a user
     */
    async getLatestPredictions(
        userId: string,
        modelType: ModelType,
        timeframe: TimeframeType,
        limit: number = 30
    ): Promise<CashFlowPrediction[]> {
        const query = `
            SELECT *
            FROM cash_flow_predictions
            WHERE user_id = $1
            AND model_type = $2
            AND timeframe = $3
            AND prediction_date >= CURRENT_DATE
            ORDER BY prediction_date ASC
            LIMIT $4
        `;

        const result = await db.query(query, [userId, modelType, timeframe, limit]);
        return result.rows.map(this.mapRowToPrediction);
    }

    /**
     * Map database row to CashFlowPrediction type
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