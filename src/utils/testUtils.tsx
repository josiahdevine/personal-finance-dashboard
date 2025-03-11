import React, { ReactNode } from 'react';
import { render } from '@testing-library/react';
import {
  User,
  Account,
  Transaction,
  Budget,
  Goal,
  AccountType,
  AccountSubtype,
  TransactionType,
  TransactionStatus,
  BudgetPeriod,
  GoalStatus,
  NotificationType,
  NotificationPriority,
  Currency
} from '../types';

// UUID Generator
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// ISO8601 DateTime Generator
const generateISO8601DateTime = (date?: Date): string => {
  return (date || new Date()).toISOString();
};

// Create mock data generators
export const createMockUser = (overrides?: Partial<User>): User => ({
  uid: generateUUID(),
  email: 'test@example.com',
  displayName: 'Test User',
  emailVerified: true,
  createdAt: generateISO8601DateTime(),
  updatedAt: generateISO8601DateTime(),
  ...overrides
});

export const createMockAccount = (overrides?: Partial<Account>): Account => ({
  id: generateUUID(),
  userId: generateUUID(),
  name: 'Test Account',
  type: AccountType.CHECKING,
  balance: 1000,
  currency: Currency.USD,
  institution: {
    id: generateUUID(),
    name: 'Test Bank',
    logo: 'https://example.com/logo.png'
  },
  isActive: true,
  lastSync: generateISO8601DateTime(),
  createdAt: generateISO8601DateTime(),
  updatedAt: generateISO8601DateTime(),
  ...overrides
});

export const createMockTransaction = (overrides?: Partial<Transaction>): Transaction => ({
  id: generateUUID(),
  accountId: generateUUID(),
  userId: generateUUID(),
  date: generateISO8601DateTime(),
  amount: 100,
  currency: Currency.USD,
  description: 'Test Transaction',
  category: {
    id: generateUUID(),
    name: 'Test Category',
    icon: 'test-icon',
    color: '#000000'
  },
  type: TransactionType.EXPENSE,
  status: TransactionStatus.POSTED,
  merchantName: 'Test Merchant',
  merchantLogo: 'https://example.com/merchant.png',
  location: {
    address: '123 Test St',
    city: 'Test City',
    region: 'Test Region',
    postalCode: '12345',
    country: 'Test Country'
  },
  tags: ['test'],
  notes: 'Test notes',
  createdAt: generateISO8601DateTime(),
  updatedAt: generateISO8601DateTime(),
  ...overrides
});

export const createMockBudget = (overrides?: Partial<Budget>): Budget => ({
  id: generateUUID(),
  userId: generateUUID(),
  name: 'Test Budget',
  amount: 1000,
  currency: Currency.USD,
  period: BudgetPeriod.MONTHLY,
  categoryId: generateUUID(),
  startDate: generateISO8601DateTime(),
  endDate: generateISO8601DateTime(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
  isRecurring: true,
  notifications: true,
  createdAt: generateISO8601DateTime(),
  updatedAt: generateISO8601DateTime(),
  ...overrides
});

export const createMockGoal = (overrides?: Partial<Goal>): Goal => ({
  id: generateUUID(),
  userId: generateUUID(),
  name: 'Test Goal',
  description: 'Test Goal Description',
  targetAmount: 10000,
  currentAmount: 5000,
  currency: Currency.USD,
  deadline: generateISO8601DateTime(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)),
  status: GoalStatus.IN_PROGRESS,
  category: {
    id: generateUUID(),
    name: 'Test Category',
    icon: 'test-icon',
    color: '#000000'
  },
  notifications: true,
  createdAt: generateISO8601DateTime(),
  updatedAt: generateISO8601DateTime(),
  ...overrides
});

// Create mock data generators for arrays
export const createMockAccounts = (count = 5): Account[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: generateUUID(),
    userId: generateUUID(),
    name: `Test Account ${index}`,
    type: AccountType.DEPOSITORY,
    subtype: AccountSubtype.CHECKING,
    balance: 10000 + (index * 1000),
    currency: Currency.USD,
    institution: {
      id: generateUUID(),
      name: `Test Bank ${index}`,
      logo: `https://example.com/bank${index}.png`,
      primaryColor: '#FF0000',
      url: `https://example.com/bank${index}`
    },
    mask: `****${4000 + index}`,
    isActive: true,
    lastSync: generateISO8601DateTime(),
    createdAt: generateISO8601DateTime(),
    updatedAt: generateISO8601DateTime()
  }));
};

export const createMockTransactions = (count = 10): Transaction[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: generateUUID(),
    accountId: generateUUID(),
    userId: generateUUID(),
    date: generateISO8601DateTime(new Date(Date.now() - index * 24 * 60 * 60 * 1000)),
    amount: 100 + (index * 10),
    currency: Currency.USD,
    description: `Test Transaction ${index}`,
    category: {
      id: generateUUID(),
      name: `Category ${index}`,
      icon: `test-icon-${index}`,
      color: '#FF0000'
    },
    type: TransactionType.EXPENSE,
    status: TransactionStatus.POSTED,
    merchantName: `Test Merchant ${index}`,
    merchantLogo: `https://example.com/merchant${index}.png`,
    location: {
      address: `${index} Test St`,
      city: 'Test City',
      region: 'Test Region',
      postalCode: '12345',
      country: 'Test Country',
      lat: 40.7128 + (index * 0.01),
      lon: -74.0060 + (index * 0.01)
    },
    tags: [`tag${index}`],
    notes: `Test notes ${index}`,
    createdAt: generateISO8601DateTime(),
    updatedAt: generateISO8601DateTime()
  }));
};

export const createMockBudgets = (count = 3): Budget[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: generateUUID(),
    userId: generateUUID(),
    name: `Test Budget ${index}`,
    amount: 1000 + (index * 100),
    currency: Currency.USD,
    period: BudgetPeriod.MONTHLY,
    categoryId: generateUUID(),
    startDate: generateISO8601DateTime(),
    endDate: generateISO8601DateTime(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
    isRecurring: true,
    notifications: true,
    createdAt: generateISO8601DateTime(),
    updatedAt: generateISO8601DateTime()
  }));
};

export const createMockGoals = (count = 3): Goal[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: generateUUID(),
    userId: generateUUID(),
    name: `Test Goal ${index}`,
    description: `Test Goal Description ${index}`,
    targetAmount: 10000 + (index * 1000),
    currentAmount: 5000 + (index * 500),
    currency: Currency.USD,
    deadline: generateISO8601DateTime(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)),
    status: GoalStatus.IN_PROGRESS,
    category: {
      id: generateUUID(),
      name: `Category ${index}`,
      icon: `test-icon-${index}`,
      color: '#FF0000'
    },
    notifications: true,
    createdAt: generateISO8601DateTime(),
    updatedAt: generateISO8601DateTime()
  }));
};

export const createMockNotifications = (count = 5) => {
  return Array.from({ length: count }, (_, index) => ({
    id: generateUUID(),
    type: NotificationType.GOAL_PROGRESS,
    title: `Test Notification ${index}`,
    message: `Test notification message ${index}`,
    priority: NotificationPriority.MEDIUM,
    timestamp: generateISO8601DateTime(new Date(Date.now() - index * 60 * 60 * 1000)),
    read: false,
    actionUrl: `https://example.com/action/${index}`,
    metadata: {
      goalId: generateUUID(),
      progress: 50 + index
    }
  }));
};

// Export test data creators with proper naming that matches importers
export const createTestData = {
  user: createMockUser,
  account: createMockAccount,
  accounts: createMockAccounts,
  transaction: createMockTransaction,
  transactions: createMockTransactions,
  budget: createMockBudget,
  budgets: createMockBudgets,
  goal: createMockGoal,
  goals: createMockGoals,
  notifications: createMockNotifications
};

// Test Providers
interface AllProvidersProps {
  children: ReactNode;
}

const AllProviders: React.FC<AllProvidersProps> = ({ children }) => {
  return <>{children}</>;
};

// Custom render method
const customRender = (ui: React.ReactElement, options = {}) =>
  render(ui, { wrapper: AllProviders, ...options });

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { customRender as render };

// Custom matcher interfaces using ES2015 module syntax instead of namespaces
export interface CustomMatchers<R = void> {
  toBeValidUUID(): R;
  toBeValidISO8601(): R;
  toBeValidCurrency(): R;
}

// Use proper module augmentation syntax for Jest
declare global {
  // We need to use namespace here as it's the correct way to augment existing typings
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    // Add properties to make these interfaces not empty
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface AsymmetricMatchers extends CustomMatchers {}
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Matchers<R> extends CustomMatchers<R> {}
  }
}

// Custom matchers implementation
const customMatchers = {
  toBeValidUUID(received: unknown): jest.CustomMatcherResult {
    const pass = typeof received === 'string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(received);

    return {
      pass,
      message: () => `Expected ${received} ${pass ? 'not ' : ''}to be a valid UUID`
    };
  },

  toBeValidISO8601(received: unknown): jest.CustomMatcherResult {
    const pass = typeof received === 'string' &&
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/.test(received);

    return {
      pass,
      message: () => `Expected ${received} ${pass ? 'not ' : ''}to be a valid ISO8601 datetime string`
    };
  },

  toBeValidCurrency(received: unknown): jest.CustomMatcherResult {
    const validCurrencies = Object.values(Currency);
    const pass = typeof received === 'string' && validCurrencies.includes(received as Currency);

    return {
      pass,
      message: () => `Expected ${received} ${pass ? 'not ' : ''}to be a valid currency code`
    };
  }
};

expect.extend(customMatchers);
