/**
 * logger.js - Centralized logging utility for consistent error tracking
 */

// Initialize logging module
console.log('Initializing logger module');

// Set this to false in production if you want to disable verbose logging
const VERBOSE_LOGGING = process.env.NODE_ENV === 'development';

// Track component rendering for performance monitoring
const componentRenderCounts = {};

/**
 * Log a message with consistent formatting
 * 
 * @param {string} component - The component or file name
 * @param {string} message - The log message
 * @param {object} data - Optional data to include in the log
 */
export const log = (component, message, data = null) => {
  if (!VERBOSE_LOGGING && !message.includes('error') && !message.includes('fail')) {
    return; // Only log errors in production
  }
  
  const logData = data ? ` | ${JSON.stringify(data)}` : '';
  console.log(`[${component}] ${message}${logData}`);
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
  const errorInfo = {
    message: error?.message || 'Unknown error',
    stack: error?.stack,
    ...additionalData
  };
  
  console.error(`[${component}] ERROR: ${message}`, errorInfo);
  
  // You could send this to an error reporting service like Sentry here
  // if (process.env.NODE_ENV === 'production') {
  //   sendToErrorReportingService(component, message, errorInfo);
  // }
};

/**
 * Log a component render with performance tracking
 * 
 * @param {string} componentName - The name of the component
 * @param {object} props - The component props (optional)
 */
export const logRender = (componentName, props = null) => {
  if (!VERBOSE_LOGGING) return;
  
  // Track render count
  componentRenderCounts[componentName] = (componentRenderCounts[componentName] || 0) + 1;
  
  // Log render with count
  const count = componentRenderCounts[componentName];
  const renderCountInfo = count > 3 ? ` (Render #${count})` : '';
  
  if (props) {
    // Filter out functions from props for cleaner logs
    const filteredProps = Object.entries(props).reduce((acc, [key, value]) => {
      if (typeof value !== 'function') {
        acc[key] = value;
      } else {
        acc[key] = '[Function]';
      }
      return acc;
    }, {});
    
    log(componentName, `Rendering${renderCountInfo}`, filteredProps);
  } else {
    log(componentName, `Rendering${renderCountInfo}`);
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
  if (!VERBOSE_LOGGING) return fn();
  
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