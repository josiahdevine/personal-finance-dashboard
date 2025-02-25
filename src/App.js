import React, { useEffect, createContext, useState, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PlaidProvider } from './contexts/PlaidContext';
import { FinanceDataProvider } from './contexts/FinanceDataContext';
import Login from './Components/auth/Login';
import Register from './Components/auth/Register';
import LandingPage from './pages/LandingPage';
import Sidebar from './Components/Sidebar';
import HeaderWithAuth from './Components/HeaderWithAuth';
import ErrorBoundary from './Components/ErrorBoundary';
import ResponsiveWrapper from './Components/ResponsiveWrapper';
import { log, logError, logRender } from './utils/logger';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Import page components
import Dashboard from './pages/Dashboard';
import SalaryJournal from './Components/SalaryJournal';
import BillsAnalysis from './Components/BillsAnalysis';
import Goals from './Components/Goals';
import LinkAccounts from './Components/LinkAccounts';
import Transactions from './Components/Transactions';
import AskAI from './Components/AskAI';
import SubscriptionPlans from './Components/SubscriptionPlans';

// Import mobile versions of components
import AccountConnectionsMobile from './mobile/AccountConnectionsMobile';
import SubscriptionPlansMobile from './mobile/SubscriptionPlansMobile';

// Import Stripe context provider
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

log('App', 'Initializing App component');

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

// Create sidebar context for managing sidebar state
export const SidebarContext = createContext();

export function useSidebar() {
  return useContext(SidebarContext);
}

// Desktop layout component
const DesktopLayout = ({ children }) => {
  const { isSidebarOpen } = useSidebar();
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <HeaderWithAuth />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

// Protected Route component
const PrivateRoute = ({ children }) => {
  logRender('PrivateRoute');
  const { currentUser, loading, authError } = useAuth();
  
  log('App', 'PrivateRoute auth state', { 
    currentUserExists: !!currentUser, 
    loading,
    hasAuthError: !!authError
  });
  
  if (loading) {
    log('App', 'PrivateRoute - Auth is loading, showing loading state');
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading authentication state...</p>
        </div>
      </div>
    );
  }
  
  // Show error state if there's an auth error
  if (authError) {
    logError('App', 'PrivateRoute - Auth error encountered', 
      new Error(authError.message), { code: authError.code });
      
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Authentication Error</h3>
            <p className="text-sm text-red-700 mt-1">{authError.message}</p>
            <div className="mt-2">
              <button 
                className="text-sm text-red-600 hover:text-red-500" 
                onClick={() => window.location.href = '/login'}
              >
                Return to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return currentUser ? children : <Navigate to="/login" />;
};

// Determine if the route should use a mobile component version
const useMobileComponentFor = (path) => {
  const components = {
    '/link-accounts': AccountConnectionsMobile,
    '/subscription': SubscriptionPlansMobile,
    // Add more mobile components here as they're created
  };
  
  return components[path];
};

// AuthenticatedLayout that handles the responsive layout
const AuthenticatedLayout = ({ children }) => {
  const location = useLocation();
  const MobileComponent = useMobileComponentFor(location.pathname);
  
  // Store sidebar open/closed state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const toggleSidebar = (forceState) => {
    if (typeof forceState === 'boolean') {
      setIsSidebarOpen(forceState);
    } else {
      setIsSidebarOpen(prev => !prev);
    }
  };
  
  // If we have a specific mobile component for this route, use it
  if (MobileComponent) {
    return (
      <SidebarContext.Provider value={{ isSidebarOpen, toggleSidebar }}>
        <ResponsiveWrapper desktopLayout={DesktopLayout}>
          <MobileComponent />
        </ResponsiveWrapper>
      </SidebarContext.Provider>
    );
  }
  
  // Otherwise just use the responsive wrapper with children
  return (
    <SidebarContext.Provider value={{ isSidebarOpen, toggleSidebar }}>
      <ResponsiveWrapper desktopLayout={DesktopLayout}>
        {children}
      </ResponsiveWrapper>
    </SidebarContext.Provider>
  );
};

function App() {
  logRender('App');
  
  useEffect(() => {
    log('App', 'App component mounted');
    
    // Add global error handler for unhandled promise rejections
    const handleUnhandledRejection = (event) => {
      logError('App', 'Unhandled Promise Rejection', event.reason, {
        type: 'unhandledrejection',
        stack: event.reason?.stack
      });
      event.preventDefault();
    };

    // Add global error handler for uncaught errors
    const handleError = (event) => {
      logError('App', 'Uncaught Error', event.error || new Error(event.message), {
        type: 'error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
      event.preventDefault();
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);
    
    return () => {
      log('App', 'App component unmounting');
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  // Validate all required components are loaded
  const requiredComponents = [
    Dashboard, SalaryJournal, BillsAnalysis, 
    Goals, LinkAccounts, Transactions, AskAI, SubscriptionPlans
  ];

  if (requiredComponents.some(comp => !comp)) {
    console.error('Some required components are not available');
  }

  return (
    <ErrorBoundary componentName="AppRoot">
      <Router>
        <AuthProvider>
          <PlaidProvider>
            <FinanceDataProvider>
              <Elements stripe={stripePromise}>
                <ToastContainer position="top-right" autoClose={5000} />
                <Routes>
                  {/* Public routes */}
                  <Route path="/landing" element={<LandingPage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  
                  {/* Authenticated routes with layout */}
                  <Route 
                    path="/" 
                    element={
                      <PrivateRoute>
                        <AuthenticatedLayout>
                          <Dashboard />
                        </AuthenticatedLayout>
                      </PrivateRoute>
                    } 
                  />
                  
                  <Route 
                    path="/salary-journal" 
                    element={
                      <PrivateRoute>
                        <AuthenticatedLayout>
                          <SalaryJournal />
                        </AuthenticatedLayout>
                      </PrivateRoute>
                    } 
                  />
                  
                  <Route 
                    path="/bills-analysis" 
                    element={
                      <PrivateRoute>
                        <AuthenticatedLayout>
                          <BillsAnalysis />
                        </AuthenticatedLayout>
                      </PrivateRoute>
                    } 
                  />
                  
                  <Route 
                    path="/goals" 
                    element={
                      <PrivateRoute>
                        <AuthenticatedLayout>
                          <Goals />
                        </AuthenticatedLayout>
                      </PrivateRoute>
                    } 
                  />
                  
                  <Route 
                    path="/link-accounts" 
                    element={
                      <PrivateRoute>
                        <AuthenticatedLayout>
                          <LinkAccounts />
                        </AuthenticatedLayout>
                      </PrivateRoute>
                    } 
                  />
                  
                  <Route 
                    path="/transactions" 
                    element={
                      <PrivateRoute>
                        <AuthenticatedLayout>
                          <Transactions />
                        </AuthenticatedLayout>
                      </PrivateRoute>
                    } 
                  />
                  
                  <Route 
                    path="/ask-ai" 
                    element={
                      <PrivateRoute>
                        <AuthenticatedLayout>
                          <AskAI />
                        </AuthenticatedLayout>
                      </PrivateRoute>
                    } 
                  />
                  
                  <Route 
                    path="/subscription" 
                    element={
                      <PrivateRoute>
                        <AuthenticatedLayout>
                          <SubscriptionPlans />
                        </AuthenticatedLayout>
                      </PrivateRoute>
                    } 
                  />
                  
                  {/* Redirect all other routes to dashboard */}
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </Elements>
            </FinanceDataProvider>
          </PlaidProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;