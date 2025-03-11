import {
  AccountType,
  AccountSubtype,
  TransactionType,
  TransactionStatus,
  BudgetPeriod,
  BudgetStatus,
  GoalStatus,
  NotificationType,
  NotificationPriority,
  Currency
} from './enums';

// Re-export all enums
export {
  AccountType,
  AccountSubtype,
  TransactionType,
  TransactionStatus,
  BudgetPeriod,
  BudgetStatus,
  GoalStatus,
  NotificationType,
  NotificationPriority,
  Currency
};

// Base Types
export type UUID = string;
export type ISO8601DateTime = string;

// User Types
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  emailVerified: boolean;
  createdAt: ISO8601DateTime;
  updatedAt: ISO8601DateTime;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  currency: Currency;
  notifications: NotificationPreferences;
  defaultDashboard: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  types: {
    [key in NotificationType]?: boolean;
  };
}

// Account Types
export interface Account {
  id: UUID;
  userId: UUID;
  name: string;
  type: AccountType;
  subtype?: AccountSubtype;
  balance: number;
  currency: Currency;
  institution: Institution;
  mask?: string;
  isActive: boolean;
  lastSync: ISO8601DateTime;
  createdAt: ISO8601DateTime;
  updatedAt: ISO8601DateTime;
}

export interface Institution {
  id: UUID;
  name: string;
  logo: string;
  primaryColor?: string;
  url?: string;
}

// Transaction Types
export interface Transaction {
  id: UUID;
  accountId: UUID;
  userId: UUID;
  date: ISO8601DateTime;
  amount: number;
  currency: Currency;
  description: string;
  category: TransactionCategory;
  type: TransactionType;
  status: TransactionStatus;
  merchantName?: string;
  merchantLogo?: string;
  location?: Location;
  tags?: string[];
  notes?: string;
  createdAt: ISO8601DateTime;
  updatedAt: ISO8601DateTime;
}

export interface TransactionCategory {
  id: UUID;
  name: string;
  icon: string;
  color: string;
}

export interface Location {
  address?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
  lat?: number;
  lon?: number;
}

// Budget Types
export interface Budget {
  id: UUID;
  userId: UUID;
  name: string;
  amount: number;
  currency: Currency;
  period: BudgetPeriod;
  categoryId: UUID;
  startDate: ISO8601DateTime;
  endDate: ISO8601DateTime;
  isRecurring: boolean;
  notifications: boolean;
  createdAt: ISO8601DateTime;
  updatedAt: ISO8601DateTime;
}

export interface BudgetProgress {
  budgetId: UUID;
  spent: number;
  remaining: number;
  percentage: number;
  status: BudgetStatus;
}

// Goal Types
export interface Goal {
  id: UUID;
  userId: UUID;
  name: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  currency: Currency;
  deadline: ISO8601DateTime;
  status: GoalStatus;
  category: TransactionCategory;
  notifications: boolean;
  createdAt: ISO8601DateTime;
  updatedAt: ISO8601DateTime;
}

// Notification Types
export interface Notification {
  id: UUID;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  timestamp: ISO8601DateTime;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

// API Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

export interface ApiError {
  message: string;
  code: string;
  details: Record<string, unknown>;
}

export interface ApiMeta {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

// UI Component Types
export interface BaseComponentProps {
  className?: string;
  style?: React.CSSProperties;
}

export interface LoadingProps extends BaseComponentProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
}

export interface ErrorProps extends BaseComponentProps {
  message: string;
  retry?: () => void;
}

export interface Badge {
  text: string;
  color: string;
  icon?: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface TimeFrameOption {
  value: string;
  label: string;
  days: number;
}

// Add TimeFrame export - the exact implementation depends on existing code, 
// but here's a placeholder if it doesn't exist yet
export enum TimeFrame {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
  ALL = 'all'
}
