/**
 * Deployment Debug Utility
 * 
 * This utility helps diagnose issues in production deployments by:
 * 1. Checking for common issues (missing APIs, broken imports, etc)
 * 2. Logging detailed information about the runtime environment
 * 3. Providing detailed error information for Plaid and navigation problems
 */

import { log, logError } from './logger';

// Check if we're running in production mode
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Run a full diagnostics check of the app
 */
export const runDiagnostics = () => {
  try {
    log('Diagnostics', 'Running deployment diagnostics');
    
    // Check environment
    const environment = {
      nodeEnv: process.env.NODE_ENV,
      buildTime: process.env.REACT_APP_BUILD_TIME || 'unknown',
      buildId: process.env.REACT_APP_BUILD_ID || 'unknown',
      userAgent: window.navigator?.userAgent || 'unknown',
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      url: window.location.href
    };
    
    log('Diagnostics', 'Environment info', environment);
    
    // Check for important global objects
    checkGlobalObjects();
    
    // Check window features that might be missing in some environments
    checkWindowFeatures();
    
    // Report any already caught errors
    reportExistingErrors();
    
    log('Diagnostics', 'Diagnostics completed successfully');
    return {
      success: true,
      environment
    };
  } catch (error) {
    logError('Diagnostics', 'Error running diagnostics', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Check that essential global objects are available
 */
const checkGlobalObjects = () => {
  const checks = {
    window: typeof window !== 'undefined',
    document: typeof document !== 'undefined',
    localStorage: typeof localStorage !== 'undefined',
    navigator: typeof navigator !== 'undefined',
    fetch: typeof fetch === 'function',
    Promise: typeof Promise === 'function'
  };
  
  log('Diagnostics', 'Global object availability', checks);
  
  // Report any missing objects
  const missing = Object.entries(checks)
    .filter(([_, exists]) => !exists)
    .map(([name]) => name);
    
  if (missing.length > 0) {
    logError('Diagnostics', 'Missing essential global objects', 
      new Error(`Missing: ${missing.join(', ')}`));
  }
};

/**
 * Check for browser features that might be missing
 */
const checkWindowFeatures = () => {
  try {
    // Detect localStorage availability (might be disabled)
    let localStorageAvailable = false;
    try {
      localStorage.setItem('diagnostics_test', 'test');
      localStorageAvailable = localStorage.getItem('diagnostics_test') === 'test';
      localStorage.removeItem('diagnostics_test');
    } catch (e) {
      localStorageAvailable = false;
    }
    
    // Check other features
    const features = {
      localStorage: localStorageAvailable,
      sessionStorage: typeof sessionStorage !== 'undefined',
      history: typeof window.history !== 'undefined' && typeof window.history.pushState === 'function',
      geolocation: navigator && 'geolocation' in navigator,
      serviceWorker: navigator && 'serviceWorker' in navigator
    };
    
    log('Diagnostics', 'Browser features availability', features);
  } catch (error) {
    logError('Diagnostics', 'Error checking window features', error);
  }
};

/**
 * Report any errors that have already been caught
 */
const reportExistingErrors = () => {
  try {
    // Check for stored errors
    const storedErrors = localStorage.getItem('app_errors');
    if (storedErrors) {
      try {
        const errors = JSON.parse(storedErrors);
        log('Diagnostics', 'Found previously logged errors', { count: errors.length });
      } catch (e) {
        logError('Diagnostics', 'Error parsing stored errors', e);
      }
    }
  } catch (error) {
    // If we can't access localStorage, just log and continue
    logError('Diagnostics', 'Error reporting existing errors', error);
  }
};

/**
 * Initialize deployment debugging
 * Runs when the app starts to catch any early issues
 */
export const initDeploymentDebug = () => {
  // Only run extensive debugging in production
  if (!isProduction) {
    log('Diagnostics', 'Skipping deployment debug in development mode');
    return;
  }
  
  log('Diagnostics', 'Initializing deployment debug');
  
  // Run diagnostics
  runDiagnostics();
  
  // Set up global error handlers if not already done
  if (!window._debugHandlersInitialized) {
    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      logError('Diagnostics', 'Unhandled promise rejection', event.reason, {
        message: event.reason?.message || 'Unknown promise rejection',
        stack: event.reason?.stack
      });
    });
    
    // Track global errors
    window.addEventListener('error', (event) => {
      logError('Diagnostics', 'Unhandled error', event.error || new Error(event.message), {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno
      });
    });
    
    window._debugHandlersInitialized = true;
  }
  
  // Check for URL parameters that might indicate debugging mode
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('debug') || urlParams.has('diagnose')) {
    log('Diagnostics', 'Debug mode activated via URL parameter');
    runDiagnostics();
  }
};

// Export a default function that can be imported and run
export default initDeploymentDebug; 