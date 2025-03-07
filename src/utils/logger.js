/**
 * logger.js - Centralized logging utility for consistent error tracking
 */

// Only log initialization in development
const isProduction = process.env.NODE_ENV === 'production';
if (!isProduction) {
  console.log('Initializing logger module');
}

// Disable verbose logging in production
const _VERBOSE_LOGGING = process.env.REACT_APP_VERBOSE_LOGGING === 'true';

// Track component rendering for performance monitoring
const componentRenderCounts = {};

/**
 * Safe stringify function that handles circular references
 */
function safeStringify(obj) {
  if (!obj) return '';
  
  try {
    // Create a safe copy with circular references removed
    const seen = new WeakSet();
    const safeObj = JSON.stringify(obj, (key, value) => {
      if (key === 'auth' || key === 'firebase') return '[Firebase Object]';
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) return '[Circular Reference]';
        seen.add(value);
      }
      // Skip functions in logs
      if (typeof value === 'function') return '[Function]';
      return value;
    });
    return safeObj;
  } catch (e) {
    return '[Object cannot be stringified]';
  }
}

/**
 * Log a message with consistent formatting
 * 
 * @param {string} component - The component or file name
 * @param {string} message - The log message
 * @param {object} data - Optional data to include in the log
 */
export const log = (component, message, data = null) => {
  // Skip most logs in production
  if (isProduction && !message.includes('error') && !message.includes('fail')) {
    return;
  }
  
  try {
    const logData = data ? ` | ${safeStringify(data)}` : '';
    console.log(`[${component}] ${message}${logData}`);
  } catch (error) {
    console.log(`[${component}] ${message} (Error logging data)`);
  }
};

/**
 * Log an error with consistent formatting and stack trace
 * 
 * @param {string} component - The component or file name
 * @param {string} message - The error message
 * @param {Error} error - The error object
 * @param {object} additionalData - Optional additional context data
 */
export const logError = (component, message, error, additionalData = null) => {
  try {
    const errorInfo = {
      message: error?.message || 'Unknown error',
      stack: error?.stack,
      ...(additionalData ? additionalData : {})
    };
    
    console.error(`[${component}] ERROR: ${message}`, errorInfo);
    
    // You could send this to an error reporting service like Sentry here
    // if (isProduction) {
    //   sendToErrorReportingService(component, message, errorInfo);
    // }
  } catch (loggingError) {
    // Fallback if there's an error during logging
    console.error(`[${component}] ERROR: ${message} (Error logging details)`);
  }
};

/**
 * Log a component render with performance tracking
 * 
 * @param {string} componentName - The name of the component
 * @param {object} props - The component props (optional)
 */
export const logRender = (componentName, props = {}) => {
  try {
    if (!isProduction) {
      componentRenderCounts[componentName] = (componentRenderCounts[componentName] || 0) + 1;
      const renderCountInfo = ` (${componentRenderCounts[componentName]})`;

      if (Object.keys(props).length > 0) {
        // Filter out undefined and function props
        const filteredProps = Object.entries(props).reduce((acc, [key, value]) => {
          if (value !== undefined && typeof value !== 'function') {
            acc[key] = value;
          }
          return acc;
        }, {});

        log(componentName, `Rendering${renderCountInfo}`, filteredProps);
      } else {
        log(componentName, `Rendering${renderCountInfo}`);
      }
    }
  } catch (error) {
    // Prevent logging errors from affecting the app
    console.error(`Error in logRender for ${componentName}:`, error);
  }
};

/**
 * Track the timing of an operation
 * 
 * @param {string} component - The component or file name
 * @param {string} operation - The operation name
 * @param {Function} fn - The function to time
 * @returns {any} - The result of the function
 */
export const timeOperation = async (component, operation, fn) => {
  if (isProduction) return fn(); // In production, just run the function
  
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    log(component, `${operation} completed in ${duration.toFixed(2)}ms`);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    logError(component, `${operation} failed after ${duration.toFixed(2)}ms`, error);
    throw error;
  }
};

/**
 * Get information about the current environment
 * 
 * @returns {object} - Environment information
 */
export const getEnvironmentInfo = () => {
  return {
    nodeEnv: process.env.NODE_ENV,
    reactAppEnv: process.env.REACT_APP_ENV,
    firebaseConfigAvailable: !!process.env.REACT_APP_FIREBASE_API_KEY,
    plaidConfigAvailable: !!process.env.REACT_APP_PLAID_CLIENT_ID,
    browserInfo: typeof window !== 'undefined' ? navigator.userAgent : 'SSR',
    timestamp: new Date().toISOString(),
    renderCounts: componentRenderCounts
  };
};

/**
 * Monitor an API call and log its details
 * 
 * @param {string} component - The component making the API call
 * @param {string} endpoint - The API endpoint being called
 * @param {Function} apiCall - The function making the API call
 * @returns {Promise<any>} - The API response
 */
export const monitorApiCall = async (component, endpoint, apiCall) => {
  log(component, `API call to ${endpoint} started`);
  const start = performance.now();
  
  try {
    const response = await apiCall();
    const duration = performance.now() - start;
    log(component, `API call to ${endpoint} successful (${duration.toFixed(2)}ms)`, {
      status: response?.status || 'unknown',
      dataSize: JSON.stringify(response?.data || {}).length
    });
    return response;
  } catch (error) {
    const duration = performance.now() - start;
    logError(component, `API call to ${endpoint} failed (${duration.toFixed(2)}ms)`, error, {
      status: error?.response?.status,
      message: error?.response?.data?.message || error.message
    });
    throw error;
  }
};

// Export the default logger object
export default {
  log,
  logError,
  logRender,
  timeOperation,
  getEnvironmentInfo,
  monitorApiCall
};