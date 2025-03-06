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

export interface ValidationError {
  [key: string]: string;
}

export const validateRequired = (value: any, fieldName: string): string | undefined => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} is required`;
  }
};

export const validateEmail = (email: string): string | undefined => {
  if (!email) {
    return 'Email is required';
  }
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  if (!emailRegex.test(email)) {
    return 'Invalid email address';
  }
};

export const validatePassword = (password: string): string | undefined => {
  if (!password) {
    return 'Password is required';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  if (!/[!@#$%^&*]/.test(password)) {
    return 'Password must contain at least one special character (!@#$%^&*)';
  }
};

export const validateName = (name: string): string | undefined => {
  if (!name) {
    return 'Name is required';
  }
  if (name.length < 2) {
    return 'Name must be at least 2 characters long';
  }
  if (!/^[a-zA-Z\s-]+$/.test(name)) {
    return 'Name can only contain letters, spaces, and hyphens';
  }
};

export const validateAmount = (amount: number | string): string | undefined => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) {
    return 'Amount must be a valid number';
  }
  if (numAmount <= 0) {
    return 'Amount must be greater than 0';
  }
};

export const validateDate = (date: string): string | undefined => {
  if (!date) {
    return 'Date is required';
  }
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }
};

export const validateLength = (value: string, fieldName: string, min: number, max?: number): string | undefined => {
  if (!value) {
    return `${fieldName} is required`;
  }
  if (value.length < min) {
    return `${fieldName} must be at least ${min} characters long`;
  }
  if (max && value.length > max) {
    return `${fieldName} cannot be longer than ${max} characters`;
  }
};

export const validateUrl = (url: string): string | undefined => {
  if (!url) {
    return 'URL is required';
  }
  try {
    new URL(url);
  } catch {
    return 'Invalid URL';
  }
};

export const validatePhone = (phone: string): string | undefined => {
  if (!phone) {
    return 'Phone number is required';
  }
  const phoneRegex = /^\+?[\d\s-()]{10,}$/;
  if (!phoneRegex.test(phone)) {
    return 'Invalid phone number';
  }
};

export const validateCreditCard = (cardNumber: string): string | undefined => {
  if (!cardNumber) {
    return 'Card number is required';
  }
  const sanitizedNumber = cardNumber.replace(/\D/g, '');
  if (!/^\d{15,16}$/.test(sanitizedNumber)) {
    return 'Invalid card number';
  }
  // Luhn algorithm for credit card validation
  let sum = 0;
  let isEven = false;
  for (let i = sanitizedNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitizedNumber[i]);
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
    isEven = !isEven;
  }
  if (sum % 10 !== 0) {
    return 'Invalid card number';
  }
};

export const validateConfirmPassword = (password: string, confirmPassword: string): string | undefined => {
  if (!confirmPassword) {
    return 'Please confirm your password';
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  return undefined;
};

export const validateNumber = (value: string | number): string | undefined => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) {
    return 'Must be a valid number';
  }
};

export const validatePositiveNumber = (value: string | number): string | undefined => {
  const error = validateNumber(value);
  if (error) {
    return error;
  }
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (numValue <= 0) {
    return 'Must be a positive number';
  }
};

export const validateInteger = (value: string | number): string | undefined => {
  const error = validateNumber(value);
  if (error) {
    return error;
  }
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (!Number.isInteger(numValue)) {
    return 'Must be a whole number';
  }
};

export const validateFutureDate = (date: string): string | undefined => {
  const error = validateDate(date);
  if (error) {
    return error;
  }
  if (new Date(date) <= new Date()) {
    return 'Date must be in the future';
  }
  return undefined;
};

export const validatePastDate = (date: string): string | undefined => {
  const error = validateDate(date);
  if (error) {
    return error;
  }
  if (new Date(date) >= new Date()) {
    return 'Date must be in the past';
  }
  return undefined;
}; 