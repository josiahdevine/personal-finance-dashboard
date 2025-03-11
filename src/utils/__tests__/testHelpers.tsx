import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { TimeFrameProvider } from '../../contexts/TimeFrameContext';
import { AuthProvider } from '../../contexts/AuthContext';

// Import type guards for validation
import {
  isUUID,
  isISO8601DateTime,
  isCurrency,
  isTransactionType,
  isTransactionStatus,
  isAccountType,
  isAccountSubtype,
  isBudgetPeriod,
  isBudgetStatus,
  validateUser,
  validateAccount,
  validateTransaction,
  validateBudget,
  validateApiResponse
} from '../../types/guards';

// Create a comprehensive test wrapper that includes all providers
// This ensures that tests run in an environment similar to production
interface TestProviderProps {
  children: React.ReactNode;
  initialRoute?: string;
  mockUser?: boolean;
  mockAccount?: boolean;
  mockTransactions?: boolean;
}

export const TestProviders: React.FC<TestProviderProps> = ({
  children,
  initialRoute = '/',
  mockUser = true,
  mockAccount = false,
  mockTransactions = false,
}) => {
  // Create a QueryClient for React Query
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
      },
    },
  });

  // Setup mocks based on props
  if (mockUser) {
    jest.mock('../../hooks/useAuth', () => ({
      useAuth: () => ({
        user: {
          uid: 'test-uid',
          email: 'test@example.com',
          displayName: 'Test User',
          emailVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        isAuthenticated: true,
        isLoading: false,
      }),
    }));
  }

  if (mockAccount) {
    jest.mock('../../hooks/useAccounts', () => ({
      useAccounts: () => ({
        data: [
          {
            id: 'account-1',
            userId: 'test-uid',
            name: 'Checking Account',
            type: 'checking',
            balance: 1000,
            currency: 'USD',
            isActive: true,
            lastSync: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      }),
    }));
  }

  if (mockTransactions) {
    jest.mock('../../hooks/useTransactions', () => ({
      useTransactions: () => ({
        data: [
          {
            id: 'transaction-1',
            accountId: 'account-1',
            userId: 'test-uid',
            date: new Date().toISOString(),
            amount: 1500,
            currency: 'USD',
            description: 'Salary payment',
            category: { id: '1', name: 'Income', icon: 'money', color: 'green' },
            type: 'income',
            status: 'completed',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      }),
    }));
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <TimeFrameProvider>
            <MemoryRouter initialEntries={[initialRoute]}>
              <Routes>
                <Route path="*" element={children} />
              </Routes>
            </MemoryRouter>
          </TimeFrameProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

// Custom render function that includes all providers
export const renderWithProviders = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & {
    providerProps?: Omit<TestProviderProps, 'children'>;
  }
) => {
  const { providerProps, ...renderOptions } = options || {};
  
  return render(ui, {
    wrapper: (props) => (
      <TestProviders {...providerProps} {...props} />
    ),
    ...renderOptions,
  });
};

// Type validation helpers for tests
export const typeValidators = {
  isUUID,
  isISO8601DateTime,
  isCurrency,
  isTransactionType,
  isTransactionStatus,
  isAccountType,
  isAccountSubtype,
  isBudgetPeriod,
  isBudgetStatus,
  validateUser,
  validateAccount,
  validateTransaction,
  validateBudget,
  validateApiResponse,
};

// Mock data generation that ensures type safety
export const createMockData = {
  user: () => ({
    uid: 'test-uid',
    email: 'test@example.com',
    displayName: 'Test User',
    emailVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }),
  account: () => ({
    id: 'account-1',
    userId: 'test-uid',
    name: 'Checking Account',
    type: 'checking',
    balance: 1000,
    currency: 'USD',
    isActive: true,
    institution: { id: 'inst-1', name: 'Test Bank', logo: 'logo.png' },
    lastSync: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }),
  transaction: () => ({
    id: 'transaction-1',
    accountId: 'account-1',
    userId: 'test-uid',
    date: new Date().toISOString(),
    amount: 1500,
    currency: 'USD',
    description: 'Salary payment',
    category: { id: '1', name: 'Income', icon: 'money', color: 'green' },
    type: 'income',
    status: 'completed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }),
  budget: () => ({
    id: 'budget-1',
    userId: 'test-uid',
    name: 'Monthly Budget',
    amount: 2000,
    currency: 'USD',
    period: 'monthly',
    categoryId: '1',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    isRecurring: true,
    notifications: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }),
};
