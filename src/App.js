import React, { useEffect, createContext, useState, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PlaidProvider } from './contexts/PlaidContext';
import { PlaidLinkProvider } from './contexts/PlaidLinkContext';
import { FinanceDataProvider } from './contexts/FinanceDataContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { GeminiProvider } from './contexts/GeminiContext';
import Login from './Components/auth/Login';
import Register from './Components/auth/Register';
import LandingPage from './pages/LandingPage';
import Sidebar from './Components/Sidebar';
import AuthenticatedHeader from './Components/navigation/AuthenticatedHeader';
import ErrorBoundary from './Components/ErrorBoundary';
import ResponsiveWrapper from './Components/ResponsiveWrapper';
import { log, logError, logRender } from './utils/logger';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import initDeploymentDebug from './utils/deploymentDebug';
import runFirebaseTest from './utils/firebaseTest';
// Import migration utilities
import { checkNeedsMigration, showMigrationNotice } from './utils/authUtils';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import { initializeStripe, isStripeAvailable } from './utils/stripeUtils';
import { Elements } from '@stripe/react-stripe-js';

// Import page components
import Dashboard from './pages/Dashboard';
import SalaryJournal from './Components/SalaryJournal';
import BillsAnalysis from './Components/BillsAnalysis';
import Goals from './Components/Goals.tsx';
import LinkAccounts from './Components/LinkAccounts';
import Transactions from './Components/Transactions.tsx';
import AskAI from './Components/AskAI';
import SubscriptionPlans from './Components/SubscriptionPlans';
import UIComponentDemo from './Components/examples/UIComponentDemo';
import Profile from './pages/Profile';
import Subscription from './pages/Subscription.tsx';
import ForgotPassword from './pages/ForgotPassword.tsx';

// Import mobile versions of components
import AccountConnectionsMobile from './mobile/AccountConnectionsMobile';
import SubscriptionPlansMobile from './mobile/SubscriptionPlansMobile';

// Import Stripe context provider
import { Elements as StripeElements } from '@stripe/react-stripe-js';

log('App', 'Initializing App component');

// Store the current domain for deployment tracking
localStorage.setItem('last_domain', window.location.hostname);

// Run Firebase connectivity tests
if (process.env.NODE_ENV === 'production') {
  runFirebaseTest()
    .then(results => {
      console.log('Firebase test results:', results);
      if (!results.success) {
        console.error('Firebase tests failed. Please check the console for more details.');
      }
    })
    .catch(error => {
      console.error('Error running Firebase tests:', error);
    });
}

// Initialize deployment debugging in production
initDeploymentDebug();

// Initialize Stripe conditionally
const stripePromise = isStripeAvailable() ? initializeStripe() : null;

// Create sidebar context for managing sidebar state
const SidebarContext = createContext();

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

// Desktop layout component
const DesktopLayout = ({ children }) => {
  const { isSidebarOpen } = useSidebar();
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <AuthenticatedHeader />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

// Protected Route component
const PrivateRoute = ({ children }) => {
  logRender('PrivateRoute');
  const { currentUser, loading, authError } = useAuth();
  const navigate = useNavigate();
  
  log('App', 'PrivateRoute auth state', { 
    currentUserExists: !!currentUser, 
    loading,
    hasAuthError: !!authError
  });

  // Check for version mismatch and migration needs
  useEffect(() => {
    const needsMigration = checkNeedsMigration();
    if (needsMigration) {
      showMigrationNotice();
    }
  }, []);

  // Show loading state while auth is initializing
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div 
          className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"
          role="status"
          aria-label="Loading"
        />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/landing" />;
  }

  // Show error state if authentication error occurred
  if (authError) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <HiOutlineExclamationCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-semibold text-red-700 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">{authError.message || 'Please try logging in again.'}</p>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Render the protected content if authenticated
  return children;
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
  
  // Log current route for debugging
  useEffect(() => {
    log('App', 'Route changed', { 
      path: location.pathname,
      search: location.search 
    });
  }, [location.pathname, location.search]);
  
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
    log('App', 'Using mobile component for route', { 
      path: location.pathname,
      component: MobileComponent.name || 'UnnamedMobileComponent'
    });
    
    // Check if we need to use StripeWrapper for this component
    const needsStripeWrapper = MobileComponent === SubscriptionPlansMobile;
    
    return (
      <SidebarContext.Provider value={{ isSidebarOpen, toggleSidebar }}>
        <ResponsiveWrapper desktopLayout={DesktopLayout}>
          <ErrorBoundary componentName={`MobileRoute-${location.pathname}`}>
            {needsStripeWrapper ? (
              <StripeElements stripe={stripePromise}>
                <MobileComponent />
              </StripeElements>
            ) : (
              <MobileComponent />
            )}
          </ErrorBoundary>
        </ResponsiveWrapper>
      </SidebarContext.Provider>
    );
  }
  
  // Otherwise just use the responsive wrapper with children
  log('App', 'Using standard component for route', { path: location.pathname });
  
  return (
    <SidebarContext.Provider value={{ isSidebarOpen, toggleSidebar }}>
      <ResponsiveWrapper desktopLayout={DesktopLayout}>
        <ErrorBoundary componentName={`Route-${location.pathname}`}>
          {children}
        </ErrorBoundary>
      </ResponsiveWrapper>
    </SidebarContext.Provider>
  );
};

// Define RootRouteHandler component to properly handle the redirect based on auth state
const RootRouteHandler = () => {
  const { currentUser } = useAuth();
  
  return (
    <ErrorBoundary componentName="RootPath">
      {currentUser ? (
        <Navigate to="/dashboard" />
      ) : (
        <Navigate to="/landing" />
      )}
    </ErrorBoundary>
  );
};

// Component to handle anonymous auth for users who aren't logged in
const AnonymousAuthHandler = () => {
  const { currentUser, loading, signInAsGuest } = useAuth();
  const [authAttempted, setAuthAttempted] = useState(false);
  
  // Try anonymous sign-in if no user and not loading
  useEffect(() => {
    const attemptAnonymousAuth = async () => {
      if (!currentUser && !loading && !authAttempted) {
        setAuthAttempted(true);
        log('App', 'No user detected, attempting anonymous sign-in');
        try {
          await signInAsGuest();
          log('App', 'Anonymous sign-in successful');
        } catch (error) {
          logError('App', 'Anonymous sign-in failed, continuing as guest', error);
        }
      }
    };
    
    attemptAnonymousAuth();
  }, [currentUser, loading, signInAsGuest, authAttempted]);
  
  return null; // This component doesn't render anything
};

function App() {
  logRender('App');
  const [stripeAvailable, setStripeAvailable] = useState(isStripeAvailable());
  
  useEffect(() => {
    log('App', 'App component mounted');
    
    // Track deployment info for version checks
    localStorage.setItem('deployment_platform', 'netlify');
    localStorage.setItem('app_version', '2.0.0');
    localStorage.setItem('last_domain', window.location.hostname);
    
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

  // Conditional wrapper for Elements to handle when Stripe isn't available
  const StripeWrapper = ({ children }) => {
    if (!stripeAvailable) {
      return <>{children}</>;
    }
    
    return (
      <StripeElements stripe={stripePromise}>
        {children}
      </StripeElements>
    );
  };

  return (
    <ErrorBoundary componentName="AppRoot">
      <Router>
        <ThemeProvider>
          <AuthProvider>
            <PlaidProvider>
              <PlaidLinkProvider>
                <FinanceDataProvider>
                  <GeminiProvider>
                    <StripeWrapper>
                      {/* Anonymous auth handler */}
                      <AnonymousAuthHandler />
                      <ToastContainer position="top-right" autoClose={5000} />
                      <Routes>
                        {/* Public routes */}
                        <Route path="/landing" element={<LandingPage />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/" element={<RootRouteHandler />} />
                        
                        {/* Protected routes */}
                        <Route 
                          path="/dashboard/*" 
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
                                <Subscription />
                              </AuthenticatedLayout>
                            </PrivateRoute>
                          } 
                        />
                        
                        <Route 
                          path="/profile" 
                          element={
                            <PrivateRoute>
                              <AuthenticatedLayout>
                                <Profile />
                              </AuthenticatedLayout>
                            </PrivateRoute>
                          } 
                        />
                        
                        <Route 
                          path="/ui-components" 
                          element={
                            <PrivateRoute>
                              <AuthenticatedLayout>
                                <UIComponentDemo />
                              </AuthenticatedLayout>
                            </PrivateRoute>
                          } 
                        />
                        
                        {/* Redirect all other routes to root for proper handling */}
                        <Route path="*" element={<Navigate to="/" />} />
                      </Routes>
                    </StripeWrapper>
                  </GeminiProvider>
                </FinanceDataProvider>
              </PlaidLinkProvider>
            </PlaidProvider>
          </AuthProvider>
        </ThemeProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;