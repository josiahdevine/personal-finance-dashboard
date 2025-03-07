export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
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

export interface UserPreferences {
  theme: 'light' | 'dark';
  currency: string;
  notifications: NotificationPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  types: {
    bills: boolean;
    budgetAlerts: boolean;
    goals: boolean;
    unusualActivity: boolean;
  };
}

export type AccountType = 'depository' | 'credit' | 'loan' | 'investment' | 'other';
export type AccountSubtype = 'checking' | 'savings' | 'credit card' | 'money market' | 'cd' | 'mortgage' | 'student' | 'auto' | 'brokerage' | 'ira' | 'roth' | '401k' | 'other';

export interface Balance {
  available: number;
  current: number;
  limit: number | null;
}

export interface Institution {
  id: string;
  name: string;
}

export interface PlaidAccount {
  id: string;
  userId: string;
  plaidAccountId: string;
  name: string;
  mask: string | null;
  type: AccountType;
  subtype: AccountSubtype | null;
  institutionName: string;
  institutionId: string;
  balance: Balance;
  institution: Institution;
  isoCurrencyCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  userId: string;
  amount: number;
  currency: string;
  date: string;
  description: string;
  category?: string;
  type: 'credit' | 'debit';
  status: 'pending' | 'posted';
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  institution: string;
  status?: 'active' | 'inactive';
  lastSync?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  remaining: number;
  categoryId: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  type: 'savings' | 'debt' | 'investment';
  status: 'active' | 'completed' | 'cancelled';
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Bill {
  id: string;
  userId: string;
  name: string;
  amount: number;
  dueDate: string;
  frequency: 'monthly' | 'weekly' | 'yearly' | 'once';
  category: string;
  status: 'paid' | 'pending' | 'overdue';
  autoPay: boolean;
  notifications: boolean;
  paymentMethod?: string;
  notes?: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  parentId?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  createdAt: string;
  readAt?: string;
  category?: string;
  actionUrl?: string;
  actionLabel?: string;
}

export interface Report {
  id: string;
  userId: string;
  type: 'income' | 'expense' | 'cashflow' | 'budget' | 'goals';
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
  data: any;
  createdAt: string;
  format: 'pdf' | 'csv' | 'json';
  status: 'pending' | 'completed' | 'failed';
  error?: string;
}

export interface Subscription {
  id: string;
  userId: string;
  name: string;
  amount: number;
  frequency: 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
  category: string;
  provider: string;
  status: 'active' | 'cancelled' | 'paused';
  nextBillingDate: string;
  paymentMethod?: string;
  notes?: string;
}

export interface AggregatedAccount extends PlaidAccount {
  transactions: Transaction[];
  institution: {
    id: string;
    name: string;
    logo?: string;
  };
}

export type GoalCategory = 'savings' | 'investment' | 'debt' | 'purchase';
export type GoalStatus = 'active' | 'completed' | 'cancelled';

export interface ApiError {
  status: number;
  code: string;
  message: string;
  details?: Record<string, any>;
  isNetworkError?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filter?: Record<string, any>;
}

export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  categories?: string[];
  accounts?: string[];
  minAmount?: number;
  maxAmount?: number;
  searchTerm?: string;
}

export interface CategoryTotal {
  [category: string]: number;
}

export type Status = 'success' | 'warning' | 'error' | 'info';

export interface CategoryRule {
  id: string;
  pattern: string;
  categoryId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Backup {
  id: string;
  name: string;
  type: 'full' | 'partial';
  status: 'pending' | 'completed' | 'failed';
  url?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface APIKey {
  id: string;
  name: string;
  key: string;
  lastUsed?: string;
  expiresAt?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface APIKeyResponse {
  id: string;
  name: string;
  key: string;
  expiresAt?: string;
}

export interface BudgetAlert {
  id: string;
  budgetId: string;
  type: 'warning' | 'critical';
  message: string;
  threshold: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  user: {
    id: string;
    email: string;
    name: string;
    role: 'user' | 'admin';
  } | null;
}

export interface CreateBudgetData {
  name: string;
  amount: number;
  categoryId: string;
  startDate: string;
  endDate: string;
}

export interface UpdateBudgetData {
  name?: string;
  amount?: number;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
}

// Common Types
export interface BaseModel {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Settings Types
export interface Settings {
  theme: 'light' | 'dark' | 'system';
  currency: string;
  language: string;
  timezone: string;
  dateFormat: string;
  notifications: {
    email: boolean;
    push: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
  };
  privacy: {
    shareData: boolean;
    collectAnalytics: boolean;
  };
}

// Category Types
export interface Category extends BaseModel {
  name: string;
  color: string;
  icon?: string;
  parentId?: string;
  isCustom: boolean;
  isHidden: boolean;
  metadata?: Record<string, any>;
}

export interface CreateCategoryData {
  name: string;
  color: string;
  icon?: string;
  parentId?: string;
  metadata?: Record<string, any>;
}

export interface UpdateCategoryData {
  name?: string;
  color?: string;
  icon?: string;
  parentId?: string;
  isHidden?: boolean;
  metadata?: Record<string, any>;
}

// Budget Types
export interface Budget extends BaseModel {
  name: string;
  amount: number;
  categoryId: string;
  period: 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
  isRecurring: boolean;
  metadata?: Record<string, any>;
}

export interface CreateBudgetData {
  name: string;
  amount: number;
  categoryId: string;
  period: 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
  isRecurring: boolean;
  metadata?: Record<string, any>;
}

export interface UpdateBudgetData {
  name?: string;
  amount?: number;
  categoryId?: string;
  period?: 'monthly' | 'yearly';
  startDate?: string;
  endDate?: string;
  isRecurring?: boolean;
  metadata?: Record<string, any>;
}

// Integration Types
export interface Integration extends BaseModel {
  name: string;
  type: 'plaid' | 'stripe' | 'quickbooks' | 'custom';
  status: 'active' | 'inactive' | 'error';
  lastSync?: string;
  error?: string;
  settings: Record<string, any>;
  metadata: Record<string, any>;
}

export interface CreateIntegrationData {
  name: string;
  type: Integration['type'];
  settings: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface UpdateIntegrationData {
  name?: string;
  settings?: Record<string, any>;
  metadata?: Record<string, any>;
}

// Backup Types
export interface Backup extends BaseModel {
  name: string;
  size: number;
  status: 'completed' | 'pending' | 'failed';
  type: 'full' | 'partial';
  downloadUrl?: string;
}

// API Key Types
export interface APIKey extends BaseModel {
  name: string;
  key: string;
  lastUsed?: string;
  expiresAt?: string;
  permissions: string[];
}

export interface CreateAPIKeyData {
  name: string;
  expiresAt?: string;
}

// Analytics Types
export interface CashFlowPrediction {
  date: string;
  amount: number;
  confidence: number;
}

export interface RiskMetrics {
  overallRisk: number;
  factors: {
    name: string;
    score: number;
    impact: 'high' | 'medium' | 'low';
  }[];
}

export interface AnalyticsData {
  cashFlowPredictions: CashFlowPrediction[];
  riskMetrics: RiskMetrics;
  insights: {
    type: string;
    message: string;
    severity: 'high' | 'medium' | 'low';
  }[];
}

// Category Rule Types
export interface CategoryRule extends BaseModel {
  categoryId: string;
  pattern: string;
}

export interface CreateCategoryRuleData {
  categoryId: string;
  pattern: string;
}

export interface Portfolio {
  id: string;
  userId: string;
  totalValue: number;
  todayChange: number;
  todayChangePercent: number;
  totalReturn: number;
  totalReturnPercent: number;
  assetAllocation: Array<{
    type: string;
    value: number;
    percentage: number;
    color: string;
  }>;
  performance: Array<{
    date: string;
    value: number;
  }>;
  recentTransactions: Array<{
    id: string;
    date: string;
    description: string;
    type: string;
    amount: number;
  }>;
  lastUpdated: string;
} 