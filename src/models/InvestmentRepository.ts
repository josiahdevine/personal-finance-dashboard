import { BaseRepository } from './BaseRepository';
import { Investment } from './types';
import { query } from '../db';
import { validateInvestment } from '../utils/validation';

export class InvestmentRepository extends BaseRepository<Investment> {
  constructor() {
    super('investments');
  }

  async create(data: Partial<Investment>): Promise<Investment> {
    const validated = validateInvestment(data);
    return super.create(validated);
  }

  async update(id: string, data: Partial<Investment>): Promise<Investment> {
    const existingInvestment = await this.findById(id);
    if (!existingInvestment) {
      throw new Error(`Investment with id ${id} not found`);
    }
    const validated = validateInvestment({ ...existingInvestment, ...data });
    const result = await super.update(id, validated);
    if (!result) {
      throw new Error(`Failed to update investment with id ${id}`);
    }
    return result;
  }

  async getPortfolioSummary(userId: string): Promise<{
    totalValue: number;
    totalGainLoss: number;
    investments: {
      type: string;
      totalValue: number;
      percentageOfPortfolio: number;
    }[];
  }> {
    const results = await query<{
      type: string;
      total_value: number;
      total_cost: number;
    }>(
      `
      SELECT
        investment_type as type,
        SUM(quantity * purchase_price) as total_cost,
        SUM(quantity * COALESCE(current_price, purchase_price)) as total_value
      FROM investments
      WHERE user_id = $1
      GROUP BY investment_type
      `,
      [userId]
    );

    const totalValue = results.reduce((sum, r) => sum + Number(r.total_value), 0);
    const totalCost = results.reduce((sum, r) => sum + Number(r.total_cost), 0);

    return {
      totalValue,
      totalGainLoss: totalValue - totalCost,
      investments: results.map(r => ({
        type: r.type,
        totalValue: Number(r.total_value),
        percentageOfPortfolio: (Number(r.total_value) / totalValue) * 100
      }))
    };
  }

  async getInvestmentsByType(
    userId: string,
    type: string
  ): Promise<Investment[]> {
    const results = await query<Investment>(
      `
      SELECT * FROM investments
      WHERE user_id = $1 AND investment_type = $2
      ORDER BY purchase_date DESC
      `,
      [userId, type]
    );

    return results;
  }

  async getInvestmentPerformance(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    date: Date;
    totalValue: number;
  }[]> {
    const results = await query<{ date: Date; total_value: number }>(
      `
      SELECT
        date_trunc('day', generate_series($2::date, $3::date, '1 day')) as date,
        SUM(
          quantity * COALESCE(
            (
              SELECT price
              FROM investment_prices
              WHERE security_id = investments.id
                AND price_date <= date_trunc('day', generate_series)
              ORDER BY price_date DESC
              LIMIT 1
            ),
            purchase_price
          )
        ) as total_value
      FROM investments
      WHERE user_id = $1
      GROUP BY date
      ORDER BY date
      `,
      [userId, startDate, endDate]
    );

    return results.map(r => ({
      date: r.date,
      totalValue: Number(r.total_value)
    }));
  }
} 