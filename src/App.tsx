import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { useAuth } from './contexts/AuthContext';
import { TimeFrameProvider } from './contexts/TimeFrameContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTheme } from './contexts/ThemeContext';

// Pages and Components
import { LandingPage } from './components/LandingPage';
import { Register } from './components/auth/Register';
import { Login } from './components/auth/Login';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Overview } from './components/Dashboard/Overview';
import { Transactions } from './pages/Dashboard/Transactions';
import { SalaryJournal } from './components/Dashboard/SalaryJournal';
import { Bills } from './pages/Dashboard/Bills';
import { BudgetPlanning } from './components/Dashboard/BudgetPlanning';
import { Analytics } from './components/Dashboard/Analytics';
import { Notifications } from './components/Dashboard/Notifications';
import { AskAI } from './components/Dashboard/AskAI';
import { Settings } from './components/Dashboard/Settings';
import CashFlowPredictionPage from './pages/CashFlowPredictionPage';
import { InvestmentPortfolioPage } from './pages/InvestmentPortfolioPage';
import ErrorBoundary from './components/ErrorBoundary';
import { PublicNavbar } from './components/navigation/PublicNavbar';
import Footer from './components/Footer';
import ResponsiveDemo from './pages/ResponsiveDemo';

// Hooks
import { useAccounts } from './hooks/useAccounts';
import type { AggregatedAccount } from './services/AccountAggregationService';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? <>{children}</> : <Navigate to="/login" />;
};

const OverviewContainer: React.FC = () => {
  const { accounts, refreshAccounts } = useAccounts();
  // Transform accounts into AggregatedAccount format
  const aggregatedAccounts = accounts.map(account => ({
    id: account.id,
    name: account.name,
    type: account.type,
    balance: { current: account.balance },
    currency: account.currency,
    source: 'manual',
    institution: account.institution,
    lastUpdated: new Date(account.updatedAt)
  })) as AggregatedAccount[];
  // Define a stub for account click handler
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

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''} bg-neutral-50 dark:bg-dark-background transition-colors duration-md`}>
      <ErrorBoundary>
        <PublicNavbar />
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/features" element={<LandingPage />} />
            <Route path="/responsive-demo" element={<ResponsiveDemo />} />

            {/* Protected Dashboard Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<OverviewContainer />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="salary" element={<SalaryJournal />} />
              <Route path="bills" element={<Bills />} />
              <Route path="budget" element={<BudgetPlanning />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="cash-flow" element={<CashFlowPredictionPage />} />
              <Route path="investments" element={<InvestmentPortfolioPage />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="ai" element={<AskAI />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
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