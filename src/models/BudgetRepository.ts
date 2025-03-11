import { BaseRepository } from './BaseRepository';
import { BudgetCategory, BudgetEntry } from './types';
import { query, transaction } from '../db';
import { validateBudgetCategory, validateBudgetEntry } from '../utils/validation';

export class BudgetCategoryRepository extends BaseRepository<BudgetCategory> {
  constructor() {
    super('budget_categories');
  }

  async create(data: Partial<BudgetCategory>): Promise<BudgetCategory> {
    const validated = validateBudgetCategory(data);
    return super.create(validated);
  }

  async update(id: string, data: Partial<BudgetCategory>): Promise<BudgetCategory> {
    const existingCategory = await this.findById(id);
    if (!existingCategory) {
      throw new Error(`Budget category with id ${id} not found`);
    }
    const validated = validateBudgetCategory({ ...existingCategory, ...data });
    return super.update(id, validated);
  }
}

export class BudgetEntryRepository extends BaseRepository<BudgetEntry> {
  constructor() {
    super('budget_entries');
  }

  async create(data: Partial<BudgetEntry>): Promise<BudgetEntry> {
    const validated = validateBudgetEntry(data);
    return super.create(validated);
  }

  async update(id: string, data: Partial<BudgetEntry>): Promise<BudgetEntry> {
    const existingEntry = await this.findById(id);
    if (!existingEntry) {
      throw new Error(`Budget entry with id ${id} not found`);
    }
    const validated = validateBudgetEntry({ ...existingEntry, ...data });
    return super.update(id, validated);
  }

  async getBudgetSummary(userId: string, month: Date): Promise<{
    category: string;
    limit: number;
    spent: number;
    remaining: number;
  }[]> {
    const results = await query(
      `
      SELECT
        bc.name as category,
        bc.monthly_limit as limit,
        COALESCE(be.spent_amount, 0) as spent,
        bc.monthly_limit - COALESCE(be.spent_amount, 0) as remaining
      FROM budget_categories bc
      LEFT JOIN budget_entries be ON bc.id = be.category_id
        AND be.month = DATE_TRUNC('month', $2::date)
      WHERE bc.user_id = $1
      ORDER BY bc.name
      `,
      [userId, month]
    ).then(rows => rows as {
      category: string;
      limit: number;
      spent: number;
      remaining: number;
    }[]);

    return results;
  }

  async updateSpentAmount(
    categoryId: string,
    month: Date,
    amount: number
  ): Promise<void> {
    await transaction(async (client) => {
      // Get or create budget entry
      const entry = await client(
        `
        INSERT INTO budget_entries (category_id, month, spent_amount)
        VALUES ($1, DATE_TRUNC('month', $2::date), $3)
        ON CONFLICT (category_id, month) DO UPDATE
        SET spent_amount = budget_entries.spent_amount + EXCLUDED.spent_amount
        RETURNING *
        `,
        [categoryId, month, amount]
      ).then(rows => rows[0] as BudgetEntry);

      if (!entry) {
        throw new Error('Failed to update budget entry');
      }
    });
  }

  async resetMonthlyBudgets(userId: string): Promise<void> {
    await transaction(async (client) => {
      const categories = await client(
        'SELECT * FROM budget_categories WHERE user_id = $1',
        [userId]
      ).then(rows => rows as BudgetCategory[]);

      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      for (const category of categories) {
        await client(
          `
          INSERT INTO budget_entries (category_id, month, spent_amount)
          VALUES ($1, $2, 0)
          ON CONFLICT (category_id, month) DO NOTHING
          `,
          [category.id, firstDayOfMonth]
        );
      }
    });
  }
} 