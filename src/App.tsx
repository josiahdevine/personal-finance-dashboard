import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TimeFrameProvider } from './contexts/TimeFrameContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTheme } from './contexts/ThemeContext';

// Pages and Components
import { LandingPage } from './Components/LandingPage';
import { Register } from './Components/auth/Register';
import { Login } from './Components/auth/Login';
import { DashboardLayout } from './Components/layout/DashboardLayout';
import { Overview } from './Components/Dashboard/Overview';
import { Transactions } from './Components/Dashboard/Transactions';
import { SalaryJournal } from './Components/Dashboard/SalaryJournal';
import { Bills } from './pages/Dashboard/Bills';
import { BudgetPlanning } from './Components/Dashboard/BudgetPlanning';
import { Analytics } from './Components/Dashboard/Analytics';
import { Notifications } from './Components/Dashboard/Notifications';
import { AskAI } from './Components/Dashboard/AskAI';
import { Settings } from './Components/Dashboard/Settings';
import CashFlowPredictionPage from './pages/CashFlowPredictionPage';
import { InvestmentPortfolioPage } from './pages/InvestmentPortfolioPage';
import ErrorBoundary from './Components/ErrorBoundary';
import PublicNavbar from './Components/navigation/PublicNavbar';
import Footer from './Components/Footer';

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
  const { state: { user } } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" />;
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

export const App: React.FC = () => {
  const { theme } = useTheme();

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <HelmetProvider>
          <AuthProvider>
            <TimeFrameProvider>
              <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-gray-900' : 'bg-gray-50'} transition-colors duration-200`}>
                <ErrorBoundary>
                  <PublicNavbar />
                  <main className="flex-grow">
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/" element={<LandingPage />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/features" element={<LandingPage />} />

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
            </TimeFrameProvider>
          </AuthProvider>
        </HelmetProvider>
      </Router>
    </QueryClientProvider>
  );
}; 