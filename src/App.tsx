import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { ThemeProvider } from './contexts/ThemeContext';
import { TimeFrameProvider } from './contexts/TimeFrameContext';
import { LandingPage } from './components/LandingPage';
import { Register } from './components/auth/Register';
import { Login } from './components/auth/Login';
import { DashboardLayout } from './components/Layout/DashboardLayout';
import { Overview } from './components/Dashboard/Overview';
import { Transactions } from './components/Dashboard/Transactions';
import { SalaryJournal } from './components/Dashboard/SalaryJournal';
import { Bills } from './pages/Dashboard/Bills';
import { BudgetPlanning } from './components/Dashboard/BudgetPlanning';
import { Analytics } from './components/Dashboard/Analytics';
import { Notifications } from './components/Dashboard/Notifications';
import { AskAI } from './components/Dashboard/AskAI';
import { Settings } from './components/Dashboard/Settings';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useAccounts } from './hooks/useAccounts';
import { useTheme } from './contexts/ThemeContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CashFlowPredictionPage } from './pages/CashFlowPredictionPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const OverviewContainer: React.FC = () => {
  const { accounts, refreshAccounts, handleAccountClick } = useAccounts();
  return (
    <Overview
      accounts={accounts}
      onRefresh={refreshAccounts}
      onAccountClick={handleAccountClick}
    />
  );
};

export const App: React.FC = () => {
  const { theme } = useTheme();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TimeFrameProvider>
          <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-gray-900' : 'bg-gray-50'} transition-colors duration-200`}>
            <ErrorBoundary>
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
                  <Route path="notifications" element={<Notifications />} />
                  <Route path="ai" element={<AskAI />} />
                  <Route path="settings" element={<Settings />} />
                </Route>

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ErrorBoundary>
          </div>
        </TimeFrameProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}; 