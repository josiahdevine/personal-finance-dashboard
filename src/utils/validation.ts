import { z } from 'zod';

// Base schema for common fields
const baseSchema = z.object({
  id: z.string().uuid().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// User schema
export const userSchema = baseSchema.extend({
  firebase_uid: z.string(),
  email: z.string().email(),
  display_name: z.string().nullable(),
  photo_url: z.string().url().nullable(),
});

// Plaid account schema
export const plaidAccountSchema = baseSchema.extend({
  user_id: z.string().uuid(),
  item_id: z.string(),
  access_token: z.string(),
  account_id: z.string(),
  account_name: z.string(),
  account_type: z.string(),
  account_subtype: z.string().nullable(),
  institution_name: z.string().nullable(),
  mask: z.string().length(4).nullable(),
});

// Transaction schema
export const transactionSchema = baseSchema.extend({
  user_id: z.string().uuid(),
  plaid_account_id: z.string().uuid().nullable(),
  plaid_transaction_id: z.string().nullable(),
  amount: z.number(),
  category: z.string().nullable(),
  subcategory: z.string().nullable(),
  description: z.string(),
  date: z.string(),
  merchant_name: z.string().nullable(),
  pending: z.boolean(),
});

// Bill schema
export const billSchema = baseSchema.extend({
  user_id: z.string().uuid(),
  name: z.string(),
  amount: z.number().positive(),
  due_date: z.string(),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  category: z.string().nullable(),
  auto_pay: z.boolean(),
  reminder_days: z.number().int().min(0),
});

// Subscription schema
export const subscriptionSchema = baseSchema.extend({
  user_id: z.string().uuid(),
  name: z.string(),
  amount: z.number().positive(),
  billing_cycle: z.enum(['monthly', 'yearly']),
  start_date: z.string(),
  category: z.string().nullable(),
  provider: z.string().nullable(),
  next_billing_date: z.string(),
  auto_renew: z.boolean(),
});

// Investment schema
export const investmentSchema = baseSchema.extend({
  user_id: z.string().uuid(),
  plaid_account_id: z.string().uuid().nullable(),
  security_name: z.string(),
  ticker_symbol: z.string().nullable(),
  quantity: z.number().positive(),
  purchase_price: z.number().positive(),
  purchase_date: z.string(),
  investment_type: z.enum(['stock', 'bond', 'crypto', 'mutual_fund', 'etf', 'other']),
});

// Budget category schema
export const budgetCategorySchema = baseSchema.extend({
  user_id: z.string().uuid(),
  name: z.string(),
  monthly_limit: z.number().positive(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).nullable(),
  icon: z.string().nullable(),
});

// Budget entry schema
export const budgetEntrySchema = baseSchema.extend({
  category_id: z.string().uuid(),
  month: z.string(),
  spent_amount: z.number().min(0),
});

// Salary entry schema
export const salaryEntrySchema = baseSchema.extend({
  user_id: z.string().uuid(),
  company: z.string(),
  position: z.string(),
  base_salary: z.number().positive(),
  bonus: z.number().min(0),
  stock_options: z.number().min(0),
  other_benefits: z.number().min(0),
  start_date: z.string(),
  end_date: z.string().nullable(),
  currency: z.string().length(3),
});

// Validation helper functions
export function validateUser(data: unknown) {
  return userSchema.parse(data);
}

export function validatePlaidAccount(data: unknown) {
  return plaidAccountSchema.parse(data);
}

export function validateTransaction(data: unknown) {
  return transactionSchema.parse(data);
}

export function validateBill(data: unknown) {
  return billSchema.parse(data);
}

export function validateSubscription(data: unknown) {
  return subscriptionSchema.parse(data);
}

export function validateInvestment(data: unknown) {
  return investmentSchema.parse(data);
}

export function validateBudgetCategory(data: unknown) {
  return budgetCategorySchema.parse(data);
}

export function validateBudgetEntry(data: unknown) {
  return budgetEntrySchema.parse(data);
}

export function validateSalaryEntry(data: unknown) {
  return salaryEntrySchema.parse(data);
}

export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}; 