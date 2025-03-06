import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { log, logError, getEnvironmentInfo } from './utils/logger';

log('index', 'Application initialization starting');

// Check all critical component imports
const importChecks = {
  react: typeof React === 'object',
  reactDOM: typeof ReactDOM === 'object',
  app: typeof App === 'function',
  errorBoundary: typeof ErrorBoundary === 'function',
  toastContainer: typeof ToastContainer === 'function'
};

const missingImports = Object.entries(importChecks)
  .filter(([_, exists]) => !exists)
  .map(([name]) => name);

if (missingImports.length > 0) {
  logError('index', 'Critical module imports missing', 
    new Error('Application cannot initialize due to missing imports'), 
    { missingImports });
}

// Configure console to preserve line numbers in development
if (process.env.NODE_ENV === 'development') {
  if (typeof window !== 'undefined') {
    // Save original console methods - this helps with debugging
    const originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info
    };

    // Override console methods to preserve stack traces
    console.log = function() {
      originalConsole.log.apply(console, arguments);
    };
    console.warn = function() {
      originalConsole.warn.apply(console, arguments);
    };
    console.error = function() {
      originalConsole.error.apply(console, arguments);
    };
    console.info = function() {
      originalConsole.info.apply(console, arguments);
    };
  }
}

// Log environment information
const envInfo = getEnvironmentInfo();
log('index', 'Application environment', envInfo);

// Set up global error handlers
if (typeof window !== 'undefined') {
  window.onerror = function(message, source, lineno, colno, error) {
    logError('index', 'Global error caught', error || new Error(message), {
      source,
      lineno,
      colno
    });
    return false; // Let default handler run too
  };

  window.addEventListener('unhandledrejection', function(event) {
    logError('index', 'Unhandled Promise Rejection', event.reason || new Error('Unknown rejection'), {
      promise: event.promise,
      type: 'unhandledrejection'
    });
  });
}

// Check for Firebase and other critical configurations
const firebaseConfig = {
  apiKeyExists: !!process.env.REACT_APP_FIREBASE_API_KEY,
  authDomainExists: !!process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectIdExists: !!process.env.REACT_APP_FIREBASE_PROJECT_ID,
  appIdExists: !!process.env.REACT_APP_FIREBASE_APP_ID
};

const missingFirebaseConfig = Object.entries(firebaseConfig)
  .filter(([_, exists]) => !exists)
  .map(([name]) => name);

if (missingFirebaseConfig.length > 0) {
  logError('index', 'Firebase configuration incomplete', 
    new Error('Firebase might not initialize correctly'), 
    { missingConfig: missingFirebaseConfig });
}

// Check for Plaid configuration if used
const plaidConfig = {
  clientIdExists: !!process.env.REACT_APP_PLAID_CLIENT_ID,
  secretExists: !!process.env.REACT_APP_PLAID_SECRET,
  environmentExists: !!process.env.REACT_APP_PLAID_ENV
};

const missingPlaidConfig = Object.entries(plaidConfig)
  .filter(([_, exists]) => !exists)
  .map(([name]) => name);

if (missingPlaidConfig.length > 0) {
  logError('index', 'Plaid configuration incomplete', 
    new Error('Plaid integration might not initialize correctly'), 
    { missingConfig: missingPlaidConfig });
}

try {
  log('index', 'Creating React root');
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    throw new Error('Root element not found! Check if the DOM is correctly loaded.');
  }
  
  const root = ReactDOM.createRoot(rootElement);
  log('index', 'React root created successfully');

  // Create a FallbackErrorComponent for critical errors
  const FallbackErrorComponent = ({ error }) => (
    <div className="p-4 m-4 bg-red-50 border border-red-300 rounded-md shadow-sm">
      <h2 className="text-xl font-bold text-red-700 mb-2">Application Error</h2>
      <p className="text-gray-800 mb-4">
        The application encountered a critical error and cannot continue.
      </p>
      <div className="bg-white p-3 rounded-md border border-red-200 mb-4">
        <p className="text-red-600 font-medium">{error?.message || 'Unknown error'}</p>
        {error?.stack && process.env.NODE_ENV === 'development' && (
          <pre className="mt-2 text-xs overflow-auto p-2 bg-gray-100 rounded">
            {error.stack}
          </pre>
        )}
      </div>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
      >
        Refresh Page
      </button>
    </div>
  );

  log('index', 'Rendering App component');
  root.render(
    <React.StrictMode>
      <ErrorBoundary 
        componentName="ApplicationRoot"
        showDetails={process.env.NODE_ENV === 'development'}
        fallback={({error}) => <FallbackErrorComponent error={error} />}
      >
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
  log('index', 'App render called successfully');
} catch (error) {
  logError('index', 'Critical error during application initialization', error);
  
  // Try to render a fallback UI if possible
  try {
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 20px; margin: 20px; background-color: #fff5f5; border: 1px solid #f56565; border-radius: 5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;">
          <h2 style="color: #c53030; margin-top: 0;">Application Failed to Load</h2>
          <p>We're sorry, but the application couldn't be loaded. Please try refreshing the page.</p>
          <div style="background-color: #ffffff; padding: 12px; border-radius: 4px; border: 1px solid #f8b4b4; margin: 10px 0;">
            <p style="color: #c53030; font-weight: 500; margin: 0 0 8px 0;">Error Details:</p>
            <p style="font-size: 14px; color: #2d3748; margin: 0;">${error.message}</p>
            ${process.env.NODE_ENV === 'development' ? `
              <pre style="margin-top: 8px; font-size: 12px; overflow-x: auto; background-color: #f7fafc; padding: 8px; border-radius: 3px;">
                ${error.stack || 'No stack trace available'}
              </pre>
            ` : ''}
          </div>
          <button onclick="window.location.reload()" style="margin-top: 15px; padding: 8px 16px; background-color: #3182ce; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
            Refresh Page
          </button>
        </div>
      `;
    }
  } catch (fallbackError) {
    logError('index', 'Even the fallback UI failed', fallbackError, { originalError: error });
  }
}

// Enable performance monitoring
const reportWebVitalsCallback = (metric) => {
  log('webVitals', 'Performance metric', metric);
  
  // You could send this to an analytics service
  if (process.env.NODE_ENV === 'production') {
    try {
      // Example of sending to analytics
      // sendToAnalytics(metric);
      
      // Or log only when values exceed thresholds
      if (metric.name === 'FCP' && metric.value > 2000) {
        logError('webVitals', 'First Contentful Paint too slow', new Error('Performance issue'), { metric });
      }
      if (metric.name === 'LCP' && metric.value > 2500) {
        logError('webVitals', 'Largest Contentful Paint too slow', new Error('Performance issue'), { metric });
      }
      if (metric.name === 'CLS' && metric.value > 0.1) {
        logError('webVitals', 'Cumulative Layout Shift too high', new Error('Performance issue'), { metric });
      }
    } catch (analyticsError) {
      logError('webVitals', 'Error sending metrics to analytics', analyticsError);
    }
  }
};

log('index', 'Setting up performance monitoring');
reportWebVitals(reportWebVitalsCallback);

log('index', 'Application initialization completed');
