import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { useAuth } from './contexts/AuthContext';
import { TimeFrameProvider } from './contexts/TimeFrameContext';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { useTheme } from './contexts/ThemeContext';
import { AggregatedAccount } from './services/AccountAggregationService';
import { Transaction } from './types/Transaction';

// Pages and Components
import { LandingPage, ErrorBoundary } from './lower-components';
import { Register } from './components/auth/Register';
import { Login } from './components/auth/Login';
import { DashboardLayout } from './components/layout/DashboardLayout';
import Overview from './components/features/dashboard/Overview';
import { TransactionSummary } from './components/features/transactions';
import SalaryJournal from './components/features/dashboard/SalaryJournal';
import Bills from './components/features/bills';
import BudgetPlanning from './components/features/dashboard/BudgetPlanning';
import Analytics from './components/features/dashboard/Analytics';
import Notifications from './components/features/dashboard/Notifications';
import AskAI from './components/features/ask-ai';
import Settings from './components/features/dashboard/Settings';
import CashFlowPredictionPage from './pages/CashFlowPredictionPage';
import { InvestmentPortfolioPage } from './pages/InvestmentPortfolioPage';
import ResponsiveDemo from './pages/ResponsiveDemo';
import PerformanceComponentsDemo from './pages/PerformanceComponentsDemo';

// Import required styles
import './styles/animations.css';

// Hooks
import { useAccounts } from './hooks/useAccounts';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();
  // If user is not authenticated, redirect to login
  if (!auth.user) {
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
};

const OverviewContainer: React.FC = () => {
  const accountsQuery = useAccounts();
  const accounts = accountsQuery.data || [];
  
  const queryClient = useQueryClient();
  const refreshAccounts = () => {
    queryClient.invalidateQueries({ queryKey: ['accounts'] });
  };
  
  const aggregatedAccounts = accounts.map((account): AggregatedAccount => ({
    id: account.id,
    name: account.name,
    type: account.type,
    balance: { 
      current: account.balance 
    },
    currency: account.currency_code || 'USD',
    source: 'manual' as const,
    institution: account.plaid_item_id || 'unknown',
    lastUpdated: new Date()
  }));

  const handleAccountClick = (account: AggregatedAccount) => {
    console.log('Account clicked:', account);
  };

  return (
    <Overview
      accounts={aggregatedAccounts}
      onRefresh={refreshAccounts}
      onAccountClick={handleAccountClick}
    />
  );
};

const AccountsContainer: React.FC = () => {
  const accountsQuery = useAccounts();
  const accounts = accountsQuery.data || [];
  
  const queryClient = useQueryClient();
  const refreshAccounts = () => {
    queryClient.invalidateQueries({ queryKey: ['accounts'] });
  };
  
  const aggregatedAccounts = accounts.map((account): AggregatedAccount => ({
    id: account.id,
    name: account.name,
    type: account.type,
    balance: { 
      current: account.balance 
    },
    currency: account.currency_code || 'USD',
    source: 'manual' as const,
    institution: account.plaid_item_id || 'unknown',
    lastUpdated: new Date()
  }));

  const handleAccountClick = (account: AggregatedAccount) => {
    console.log('Account clicked:', account);
  };

  return (
    <Overview
      accounts={aggregatedAccounts}
      onRefresh={refreshAccounts}
      onAccountClick={handleAccountClick}
    />
  );
};

// Add a TransactionsContainer component to provide the required props to TransactionSummary
const TransactionsContainer: React.FC = () => {
  // This would typically fetch transactions from an API or state
  // For now, we'll use mock data
  const mockTransactions: Transaction[] = [
    {
      id: '1',
      date: '2023-07-15',
      description: 'Grocery Shopping',
      amount: -75.50,
      category_id: 'Food',
      account_id: 'checking',
      user_id: 'user123',
      pending: false,
      transaction_type: 'debit',
      payment_channel: 'in store',
      created_at: '2023-07-15T12:00:00Z',
      updated_at: '2023-07-15T12:00:00Z'
    },
    {
      id: '2',
      date: '2023-07-14',
      description: 'Salary Deposit',
      amount: 2500.00,
      category_id: 'Income',
      account_id: 'checking',
      user_id: 'user123',
      pending: false,
      transaction_type: 'credit',
      payment_channel: 'online',
      created_at: '2023-07-14T09:00:00Z',
      updated_at: '2023-07-14T09:00:00Z'
    },
    {
      id: '3',
      date: '2023-07-10',
      description: 'Rent Payment',
      amount: -1200.00,
      category_id: 'Housing',
      account_id: 'checking',
      user_id: 'user123',
      pending: false,
      transaction_type: 'debit',
      payment_channel: 'online',
      created_at: '2023-07-10T15:30:00Z',
      updated_at: '2023-07-10T15:30:00Z'
    }
  ];

  return <TransactionSummary transactions={mockTransactions} />;
};

const AppContent: React.FC = () => {
  const { isDarkMode } = useTheme();
  const auth = useAuth();

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''} bg-neutral-50 dark:bg-dark-background transition-colors duration-md`}>
      <ErrorBoundary>
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/features" element={<LandingPage />} />
            <Route path="/responsive-demo" element={<ResponsiveDemo />} />
            <Route path="/performance-demo" element={<PerformanceComponentsDemo />} />

            {/* Protected Dashboard Routes - User must be authenticated */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<OverviewContainer />} />
              <Route path="transactions" element={<TransactionsContainer />} />
              <Route path="salary-journal" element={<SalaryJournal />} />
              <Route path="bills" element={<Bills />} />
              <Route path="budget" element={<BudgetPlanning />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="cash-flow" element={<CashFlowPredictionPage />} />
              <Route path="investments" element={<InvestmentPortfolioPage />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="ask-ai" element={<AskAI />} />
              <Route path="accounts" element={<AccountsContainer />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* If authenticated and trying to access login/register, redirect to dashboard */}
            {auth.isAuthenticated && (
              <>
                <Route path="/login" element={<Navigate to="/dashboard" replace />} />
                <Route path="/register" element={<Navigate to="/dashboard" replace />} />
              </>
            )}

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </ErrorBoundary>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <TimeFrameProvider>
          <AppContent />
        </TimeFrameProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
}; 