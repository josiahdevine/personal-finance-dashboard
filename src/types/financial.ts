import { UUID, ISO8601DateTime, Currency } from './base';

/**
 * Account types enumeration
 */
export enum AccountType {
  CHECKING = 'checking',
  SAVINGS = 'savings',
  CREDIT_CARD = 'credit_card',
  INVESTMENT = 'investment',
  LOAN = 'loan',
  OTHER = 'other'
}

/**
 * Account subtypes enumeration
 */
export enum AccountSubtype {
  PERSONAL = 'personal',
  BUSINESS = 'business',
  JOINT = 'joint'
}

/**
 * Transaction types enumeration
 */
export enum TransactionType {
  EXPENSE = 'expense',
  INCOME = 'income',
  TRANSFER = 'transfer'
}

/**
 * Transaction status enumeration
 */
export enum TransactionStatus {
  PENDING = 'pending',
  POSTED = 'posted',
  CANCELLED = 'cancelled'
}

/**
 * Account interface - represents a financial account
 */
export interface Account {
  id: UUID;
  userId: UUID;
  name: string;
  type: AccountType;
  subtype?: AccountSubtype;
  balance: number;
  availableBalance?: number;
  currency: Currency;
  institution: string;
  institutionId?: string;
  accountNumber?: string;
  routingNumber?: string;
  isActive: boolean;
  isVerified: boolean;
  lastUpdated: ISO8601DateTime;
  createdAt: ISO8601DateTime;
  updatedAt: ISO8601DateTime;
  metadata?: Record<string, any>;
}

/**
 * Transaction interface - represents a financial transaction
 */
export interface Transaction {
  id: UUID;
  accountId: UUID;
  userId: UUID;
  categoryId?: UUID;
  amount: number;
  currency: Currency;
  date: ISO8601DateTime;
  description: string;
  type: TransactionType;
  status: TransactionStatus;
  merchantName?: string;
  merchantId?: string;
  locationCity?: string;
  locationState?: string;
  locationAddress?: string;
  locationPostalCode?: string;
  locationCountry?: string;
  isRecurring: boolean;
  isPending: boolean;
  notes?: string;
  tags?: string[];
  createdAt: ISO8601DateTime;
  updatedAt: ISO8601DateTime;
  metadata?: Record<string, any>;
}

/**
 * Budget period enumeration
 */
export enum BudgetPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly'
}

/**
 * Budget status enumeration
 */
export enum BudgetStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  COMPLETED = 'completed'
}

/**
 * Budget interface - represents a spending budget
 */
export interface Budget {
  id: UUID;
  userId: UUID;
  categoryId?: UUID;
  name: string;
  amount: number;
  currency: Currency;
  period: BudgetPeriod;
  startDate: ISO8601DateTime;
  endDate?: ISO8601DateTime;
  status: BudgetStatus;
  spent: number;
  remaining: number;
  isRecurring: boolean;
  createdAt: ISO8601DateTime;
  updatedAt: ISO8601DateTime;
}

/**
 * Category interface - represents a transaction category
 */
export interface Category {
  id: UUID;
  userId: UUID;
  name: string;
  color?: string;
  icon?: string;
  parentCategoryId?: UUID;
  isDefault: boolean;
  isIncome: boolean;
  isExpense: boolean;
  isTransfer: boolean;
  createdAt: ISO8601DateTime;
  updatedAt: ISO8601DateTime;
}
