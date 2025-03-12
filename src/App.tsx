import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { useAuth } from './contexts/AuthContext';
import { TimeFrameProvider } from './contexts/TimeFrameContext';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { useTheme } from './contexts/ThemeContext';
import { AggregatedAccount } from './services/AccountAggregationService';

// Pages and Components
import { LandingPage } from './components/LandingPage';
import { Register } from './components/auth/Register';
import { Login } from './components/auth/Login';
import { DashboardLayout } from './components/layout/DashboardLayout';
import Overview from './components/features/dashboard/Overview';
import { Transactions } from './pages/Dashboard/Transactions';
import { SalaryJournal } from './pages/Dashboard/SalaryJournal';
import { Bills } from './pages/Dashboard/Bills';
import BudgetPlanning from './components/features/dashboard/BudgetPlanning';
import Analytics from './components/features/dashboard/Analytics';
import Notifications from './components/features/dashboard/Notifications';
import AskAI from './components/features/dashboard/AskAI';
import Settings from './components/features/dashboard/Settings';
import CashFlowPredictionPage from './pages/CashFlowPredictionPage';
import { InvestmentPortfolioPage } from './pages/InvestmentPortfolioPage';
import ErrorBoundary from './components/ErrorBoundary';
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
              <Route path="transactions" element={<Transactions />} />
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