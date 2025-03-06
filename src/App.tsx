import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { TimeFrameProvider } from './contexts/TimeFrameContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Pages and Components
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
import { CashFlowPredictionPage } from './pages/CashFlowPredictionPage';
import { InvestmentPortfolioPage } from './pages/InvestmentPortfolioPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import PublicNavbar from './components/navigation/PublicNavbar';
import Footer from './components/Footer';

// Hooks
import { useAccounts } from './hooks/useAccounts';
import { useTheme } from './hooks/useTheme';

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
      <Router>
        <HelmetProvider>
          <AuthProvider>
            <ThemeProvider>
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
            </ThemeProvider>
          </AuthProvider>
        </HelmetProvider>
      </Router>
    </QueryClientProvider>
  );
}; 