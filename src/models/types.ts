export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
  subscription?: {
    status: 'active' | 'canceled' | 'past_due' | 'none';
    plan: string;
    currentPeriodEnd: string;
  };
  settings?: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    currency: string;
  };
}

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  institution: string;
  lastSync?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction extends BaseModel {
  accountId: string;
  userId: string;
  amount: number;
  currency: string;
  date: string;
  description: string;
  category?: string | null;
  type: 'credit' | 'debit';
  status: 'pending' | 'posted';
  createdAt?: Date;
  updatedAt?: Date;
  created_at?: string;
  updated_at?: string;
}

export interface BaseModel {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: any;
}

export interface Bill extends BaseModel {
  userId: string;
  name: string;
  amount: number;
  dueDate: string;
  category: string | null;
  isRecurring: boolean;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  status?: 'paid' | 'unpaid' | 'overdue';
  paymentMethod?: string;
  notes?: string;
  autoPay?: boolean;
  reminderDays?: number;
  user_id?: string;
  due_date?: string;
  auto_pay?: boolean;
  reminder_days?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Subscription extends BaseModel {
  userId: string;
  name: string;
  amount: number;
  billingDate: string;
  category: string | null;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'annually';
  status: 'active' | 'canceled' | 'paused';
  provider?: string | null;
  notes?: string;
  user_id?: string;
  billing_cycle?: 'monthly' | 'yearly';
  start_date?: string;
  next_billing_date?: string;
  auto_renew?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BudgetCategory extends BaseModel {
  userId: string;
  name: string;
  description?: string;
  color: string | null;
  icon: string | null;
  isCustom?: boolean;
  parentId?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BudgetEntry extends BaseModel {
  userId: string;
  categoryId: string;
  amount: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
  notes?: string;
  user_id?: string;
  category_id?: string;
  start_date?: string;
  end_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Investment extends BaseModel {
  userId: string;
  plaid_account_id: string | null;
  security_name: string;
  ticker_symbol: string | null;
  quantity: number;
  purchase_price: number;
  purchase_date: string;
  investment_type: 'stock' | 'bond' | 'crypto' | 'mutual_fund' | 'etf' | 'other';
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PlaidAccount extends BaseModel {
  userId: string;
  item_id: string;
  access_token: string;
  account_id: string;
  account_name: string;
  account_type: string;
  account_subtype: string | null;
  institution_name: string | null;
  mask: string | null;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SalaryEntry extends BaseModel {
  userId: string;
  company: string;
  position: string;
  base_salary: number;
  bonus: number;
  stock_options: number;
  other_benefits: number;
  start_date: string;
  end_date: string | null;
  currency: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ManualAccount extends BaseModel {
  userId: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  institution: string;
  notes?: string;
  isHidden?: boolean;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
} 