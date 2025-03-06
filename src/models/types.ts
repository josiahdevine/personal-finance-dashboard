export interface BaseModel {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface User extends BaseModel {
  firebase_uid: string;
  email: string;
  display_name: string | null;
  photo_url: string | null;
}

export interface PlaidAccount extends BaseModel {
  user_id: string;
  item_id: string;
  access_token: string;
  account_id: string;
  account_name: string;
  account_type: string;
  account_subtype: string | null;
  institution_name: string | null;
  mask: string | null;
}

export interface Transaction extends BaseModel {
  user_id: string;
  plaid_account_id: string | null;
  plaid_transaction_id: string | null;
  amount: number;
  category: string | null;
  subcategory: string | null;
  description: string;
  date: string;
  merchant_name: string | null;
  pending: boolean;
}

export interface Bill extends BaseModel {
  user_id: string;
  name: string;
  amount: number;
  due_date: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  category: string | null;
  auto_pay: boolean;
  reminder_days: number;
}

export interface Subscription extends BaseModel {
  user_id: string;
  name: string;
  amount: number;
  billing_cycle: 'monthly' | 'yearly';
  start_date: string;
  category: string | null;
  provider: string | null;
  next_billing_date: string;
  auto_renew: boolean;
}

export interface Investment extends BaseModel {
  user_id: string;
  plaid_account_id: string | null;
  security_name: string;
  ticker_symbol: string | null;
  quantity: number;
  purchase_price: number;
  purchase_date: string;
  investment_type: 'stock' | 'bond' | 'crypto' | 'mutual_fund' | 'etf' | 'other';
}

export interface BudgetCategory extends BaseModel {
  user_id: string;
  name: string;
  monthly_limit: number;
  color: string | null;
  icon: string | null;
}

export interface BudgetEntry extends BaseModel {
  category_id: string;
  month: string;
  spent_amount: number;
}

export interface SalaryEntry extends BaseModel {
  user_id: string;
  company: string;
  position: string;
  base_salary: number;
  bonus: number;
  stock_options: number;
  other_benefits: number;
  start_date: string;
  end_date: string | null;
  currency: string;
}

export interface ManualAccount extends BaseModel {
  user_id: string;
  account_name: string;
  account_type: 'checking' | 'savings' | 'credit' | 'investment' | 'other';
  balance: number;
  currency: string;
  institution?: string;
  notes?: string;
}

export interface ThemeProps {
  theme: 'dark' | 'light';
}

export interface AccountSummary {
  totalBalance: number;
  totalDebt: number;
  netWorth: number;
  accountsByType: {
    [key: string]: {
      count: number;
      totalBalance: number;
    };
  };
  institutions: Array<{
    name: string;
    accountCount: number;
    totalBalance: number;
  }>;
}
