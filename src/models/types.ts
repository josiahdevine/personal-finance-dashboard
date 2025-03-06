export interface User {
  id: string;
  email: string;
  name: string;
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