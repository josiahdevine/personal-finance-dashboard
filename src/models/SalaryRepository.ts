import { BaseRepository } from './BaseRepository';
import { SalaryEntry } from './types';
import { query } from '../db';
import { validateSalaryEntry } from '../utils/validation';

export class SalaryRepository extends BaseRepository<SalaryEntry> {
  constructor() {
    super('salary_entries');
  }

  async create(data: Partial<SalaryEntry>): Promise<SalaryEntry> {
    const validated = validateSalaryEntry(data);
    return super.create(validated);
  }

  async update(id: string, data: Partial<SalaryEntry>): Promise<SalaryEntry> {
    const validated = validateSalaryEntry({ ...await this.findById(id), ...data });
    return super.update(id, validated);
  }

  async getCurrentSalary(userId: string): Promise<SalaryEntry | null> {
    const result = await query<SalaryEntry>(
      `
      SELECT * FROM salary_entries
      WHERE user_id = $1
        AND start_date <= CURRENT_DATE
        AND (end_date IS NULL OR end_date >= CURRENT_DATE)
      ORDER BY start_date DESC
      LIMIT 1
      `,
      [userId]
    );

    return result[0] || null;
  }

  async getSalaryHistory(userId: string): Promise<SalaryEntry[]> {
    const results = await query<SalaryEntry>(
      `
      SELECT * FROM salary_entries
      WHERE user_id = $1
      ORDER BY start_date DESC
      `,
      [userId]
    );

    return results;
  }

  async getAverageSalaryByPosition(position: string): Promise<{
    average_base: number;
    average_total: number;
    count: number;
  }> {
    const result = await query<{
      average_base: string;
      average_total: string;
      count: string;
    }>(
      `
      SELECT
        AVG(base_salary) as average_base,
        AVG(base_salary + bonus + stock_options + other_benefits) as average_total,
        COUNT(*) as count
      FROM salary_entries
      WHERE position = $1
        AND end_date IS NULL
      `,
      [position]
    );

    return {
      average_base: Number(result[0]?.average_base || 0),
      average_total: Number(result[0]?.average_total || 0),
      count: Number(result[0]?.count || 0),
    };
  }

  async getSalaryGrowth(userId: string): Promise<{
    year: number;
    base_salary: number;
    total_compensation: number;
  }[]> {
    const results = await query<{
      year: string;
      base_salary: string;
      total_compensation: string;
    }>(
      `
      SELECT
        EXTRACT(YEAR FROM start_date) as year,
        MAX(base_salary) as base_salary,
        MAX(base_salary + bonus + stock_options + other_benefits) as total_compensation
      FROM salary_entries
      WHERE user_id = $1
      GROUP BY year
      ORDER BY year ASC
      `,
      [userId]
    );

    return results.map(r => ({
      year: Number(r.year),
      base_salary: Number(r.base_salary),
      total_compensation: Number(r.total_compensation),
    }));
  }
} 