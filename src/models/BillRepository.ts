import { BaseRepository } from './BaseRepository';
import { Bill, Subscription } from './types';
import { query } from '../db';
import { validateBill, validateSubscription } from '../utils/validation';

export class BillRepository extends BaseRepository<Bill> {
  constructor() {
    super('bills');
  }

  async create(data: Partial<Bill>): Promise<Bill> {
    const validated = validateBill(data);
    return super.create(validated);
  }

  async update(id: string, data: Partial<Bill>): Promise<Bill> {
    const existingBill = await this.findById(id);
    if (!existingBill) {
      throw new Error(`Bill with id ${id} not found`);
    }
    const validated = validateBill({ ...existingBill, ...data });
    return super.update(id, validated);
  }

  async getUpcomingBills(userId: string, days = 30): Promise<Bill[]> {
    const results = await query<Bill>(
      `
      SELECT * FROM bills
      WHERE user_id = $1
        AND due_date >= CURRENT_DATE
        AND due_date <= CURRENT_DATE + $2::integer
      ORDER BY due_date ASC
      `,
      [userId, days]
    );

    return results;
  }

  async getBillsByCategory(userId: string, category: string): Promise<Bill[]> {
    const results = await query<Bill>(
      `
      SELECT * FROM bills
      WHERE user_id = $1 AND category = $2
      ORDER BY due_date ASC
      `,
      [userId, category]
    );

    return results;
  }

  async getTotalBillsAmount(userId: string): Promise<number> {
    const result = await query<{ total: string }>(
      `
      SELECT SUM(amount) as total
      FROM bills
      WHERE user_id = $1
      `,
      [userId]
    );

    return result[0] ? Number(result[0].total) : 0;
  }
}

export class SubscriptionRepository extends BaseRepository<Subscription> {
  constructor() {
    super('subscriptions');
  }

  async create(data: Partial<Subscription>): Promise<Subscription> {
    const validated = validateSubscription(data);
    return super.create(validated);
  }

  async update(id: string, data: Partial<Subscription>): Promise<Subscription> {
    const existingSubscription = await this.findById(id);
    if (!existingSubscription) {
      throw new Error(`Subscription with id ${id} not found`);
    }
    const validated = validateSubscription({ ...existingSubscription, ...data });
    return super.update(id, validated);
  }

  async getUpcomingRenewals(userId: string, days = 30): Promise<Subscription[]> {
    const results = await query<Subscription>(
      `
      SELECT * FROM subscriptions
      WHERE user_id = $1
        AND next_billing_date >= CURRENT_DATE
        AND next_billing_date <= CURRENT_DATE + $2::integer
        AND auto_renew = true
      ORDER BY next_billing_date ASC
      `,
      [userId, days]
    );

    return results;
  }

  async getTotalMonthlySubscriptions(userId: string): Promise<number> {
    const result = await query<{ total: string }>(
      `
      SELECT SUM(
        CASE
          WHEN billing_cycle = 'monthly' THEN amount
          WHEN billing_cycle = 'yearly' THEN amount / 12
          ELSE 0
        END
      ) as total
      FROM subscriptions
      WHERE user_id = $1 AND auto_renew = true
      `,
      [userId]
    );

    return result[0] ? Number(result[0].total) : 0;
  }

  async getSubscriptionsByProvider(userId: string, provider: string): Promise<Subscription[]> {
    const results = await query<Subscription>(
      `
      SELECT * FROM subscriptions
      WHERE user_id = $1 AND provider = $2
      ORDER BY next_billing_date ASC
      `,
      [userId, provider]
    );

    return results;
  }
} 