import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PlaidProvider } from './contexts/PlaidContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import AskAI from './components/AskAI';
import LandingPage from './pages/LandingPage';
import Header from './components/Header';
import ErrorBoundary from './components/ErrorBoundary';
import { log, logError, logRender } from './utils/logger';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

log('App', 'Initializing App component');

// Log component imports
log('App', 'Component imports check', {
  Login: typeof Login === 'function' ? 'Function Component' : typeof Login,
  Register: typeof Register === 'function' ? 'Function Component' : typeof Register,
  Dashboard: typeof Dashboard === 'function' ? 'Function Component' : typeof Dashboard,
  AskAI: typeof AskAI === 'function' ? 'Function Component' : typeof AskAI,
  LandingPage: typeof LandingPage === 'function' ? 'Function Component' : typeof LandingPage,
  Header: typeof Header === 'function' ? 'Function Component' : typeof Header,
  ErrorBoundary: typeof ErrorBoundary === 'function' ? 'Component Class/Function' : typeof ErrorBoundary
});

// Log context providers
log('App', 'Context providers check', {
  AuthProvider: typeof AuthProvider === 'function' ? 'Function Component' : typeof AuthProvider,
  PlaidProvider: typeof PlaidProvider === 'function' ? 'Function Component' : typeof PlaidProvider,
  useAuth: typeof useAuth === 'function' ? 'Hook Function' : typeof useAuth
});

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
  
  log('App', 'PrivateRoute - Auth loaded, user exists', { 
    isAuthenticated: !!currentUser,
    hasError: !!authError
  });
  
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

// HeaderWithAuth component to conditionally render Header
const HeaderWithAuth = () => {
  logRender('HeaderWithAuth');
  const { currentUser, loading } = useAuth();
  
  log('App', 'HeaderWithAuth state', { 
    authenticated: !!currentUser,
    loading
  });
  
  if (loading) return null;
  
  return currentUser ? (
    <ErrorBoundary componentName="Header">
      <Header />
    </ErrorBoundary>
  ) : null;
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
    
    // Log environment information
    log('App', 'Environment info', {
      nodeEnv: process.env.NODE_ENV,
      reactAppApiUrl: process.env.REACT_APP_API_URL,
      firebaseConfigExists: !!process.env.REACT_APP_FIREBASE_API_KEY,
      plaidConfigExists: !!process.env.REACT_APP_PLAID_CLIENT_ID,
      browserInfo: navigator.userAgent
    });
    
    return () => {
      log('App', 'App component unmounting');
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  // Validate all required components are loaded
  if (
    !Login || !Register || !Dashboard || 
    !AskAI || !LandingPage || !Header || 
    !AuthProvider || !PlaidProvider || !ErrorBoundary
  ) {
    const missingComponents = {
      Login: !Login,
      Register: !Register,
      Dashboard: !Dashboard,
      AskAI: !AskAI,
      LandingPage: !LandingPage,
      Header: !Header,
      AuthProvider: !AuthProvider,
      PlaidProvider: !PlaidProvider,
      ErrorBoundary: !ErrorBoundary
    };
    
    logError('App', 'Critical component import failure', 
      new Error('One or more critical components failed to load'), missingComponents);
      
    return (
      <div className="bg-red-50 p-6 rounded-lg shadow-md max-w-md mx-auto mt-20">
        <h2 className="text-red-600 text-xl font-bold mb-4">Application Error</h2>
        <p className="text-gray-700 mb-4">The application failed to load critical components.</p>
        <div className="bg-white p-3 rounded border border-red-200 mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Missing Components:</h3>
          <ul className="list-disc list-inside text-sm text-gray-600">
            {Object.entries(missingComponents)
              .filter(([_, isMissing]) => isMissing)
              .map(([name]) => (
                <li key={name}>{name}</li>
              ))}
          </ul>
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Reload Application
        </button>
      </div>
    );
  }

  return (
    <ErrorBoundary componentName="AppRoot" showDetails={process.env.NODE_ENV !== 'production'}>
      <ToastContainer position="top-right" autoClose={5000} />
      <Router>
        <ErrorBoundary componentName="RouterContainer">
          <AuthProvider>
            <ErrorBoundary componentName="AuthProviderContainer">
              <PlaidProvider>
                <div className="app-container">
                  <HeaderWithAuth />
                  <main className="main-content">
                    <Routes>
                      <Route 
                        path="/" 
                        element={
                          <ErrorBoundary componentName="LandingPage">
                            <LandingPage />
                          </ErrorBoundary>
                        } 
                      />
                      <Route 
                        path="/login" 
                        element={
                          <ErrorBoundary componentName="Login">
                            <Login />
                          </ErrorBoundary>
                        } 
                      />
                      <Route 
                        path="/register" 
                        element={
                          <ErrorBoundary componentName="Register">
                            <Register />
                          </ErrorBoundary>
                        } 
                      />
                      <Route
                        path="/dashboard"
                        element={
                          <ErrorBoundary componentName="DashboardRoute">
                            <PrivateRoute>
                              <ErrorBoundary componentName="Dashboard">
                                <Dashboard />
                              </ErrorBoundary>
                            </PrivateRoute>
                          </ErrorBoundary>
                        }
                      />
                      <Route
                        path="/ask-ai"
                        element={
                          <ErrorBoundary componentName="AskAIRoute">
                            <PrivateRoute>
                              <ErrorBoundary componentName="AskAI">
                                <AskAI />
                              </ErrorBoundary>
                            </PrivateRoute>
                          </ErrorBoundary>
                        }
                      />
                      <Route 
                        path="*" 
                        element={
                          <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
                            <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                            <p className="text-xl text-gray-600 mb-6">Page not found</p>
                            <a 
                              href="/" 
                              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                            >
                              Go Home
                            </a>
                          </div>
                        } 
                      />
                    </Routes>
                  </main>
                </div>
              </PlaidProvider>
            </ErrorBoundary>
          </AuthProvider>
        </ErrorBoundary>
      </Router>
    </ErrorBoundary>
  );
}

export default App;