import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { TimeFrameProvider } from './contexts/TimeFrameContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Pages
import PricingPage from './pages/PricingPage';
import LandingPage from './pages/LandingPage';
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

// Components
import PublicNavbar from './components/navigation/PublicNavbar';
import Footer from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';

// Create Query Client
const queryClient = new QueryClient();

// Define PrivateRoute component locally
interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <HelmetProvider>
          <AuthProvider>
            <ThemeProvider>
              <TimeFrameProvider>
                <ErrorBoundary>
                  <div className="flex flex-col min-h-screen">
                    <PublicNavbar />
                    <main className="flex-grow">
                      <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/pricing" element={<PricingPage />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route
                          path="/dashboard/*"
                          element={
                            <PrivateRoute>
                              <DashboardLayout />
                            </PrivateRoute>
                          }
                        >
                          <Route index element={<Overview />} />
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
                  </div>
                </ErrorBoundary>
              </TimeFrameProvider>
            </ThemeProvider>
          </AuthProvider>
        </HelmetProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App; 