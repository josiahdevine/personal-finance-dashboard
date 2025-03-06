export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  currency: string;
  notifications: NotificationPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  lowBalanceAlert: number;
  largePurchaseAlert: number;
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
  userId: string;
  plaidTransactionId: string;
  accountId: string;
  amount: number;
  date: Date;
  name: string;
  merchantName: string | null;
  category: string[];
  pending: boolean;
  type: string;
  isoCurrencyCode: string;
  location?: {
    address: string | null;
    city: string | null;
    region: string | null;
    postalCode: string | null;
    country: string | null;
    lat: number | null;
    lon: number | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: Date;
  category: string;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Budget {
  id: string;
  userId: string;
  category: string;
  amount: number;
  spent: number;
  period: 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
  createdAt: Date;
  updatedAt: Date;
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