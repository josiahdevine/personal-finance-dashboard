/**
 * Database Monitoring Utility for Neon Tech PostgreSQL
 * This module provides monitoring and metrics for database connections
 */

import fs from 'fs';
import path from 'path';

// In-memory metrics storage
let metrics = {
  totalQueries: 0,
  successfulQueries: 0,
  failedQueries: 0,
  totalQueryTime: 0,
  slowQueries: [], // Queries taking longer than threshold
  errorsByCode: {}, // Count of errors by error code
  lastErrors: [], // Last 10 errors
  connectionAttempts: 0,
  connectionFailures: 0,
  lastReset: Date.now()
};

// Configuration
const config = {
  slowQueryThreshold: 1000, // ms
  maxSlowQueries: 20,
  maxErrors: 10,
  logToFile: process.env.NODE_ENV === 'production',
  logPath: './logs/db-metrics.json',
  metricsResetInterval: 24 * 60 * 60 * 1000 // 24 hours
};

/**
 * Record a database query execution
 * @param {Object} queryInfo - Information about the query
 * @param {string} queryInfo.text - SQL query text
 * @param {number} queryInfo.duration - Query duration in ms
 * @param {boolean} queryInfo.success - Whether the query was successful
 * @param {Object} [queryInfo.error] - Error object if query failed
 */
function recordQuery(queryInfo) {
  // Check if metrics should be reset
  if (Date.now() - metrics.lastReset > config.metricsResetInterval) {
    resetMetrics();
  }

  metrics.totalQueries++;
  
  if (queryInfo.success) {
    metrics.successfulQueries++;
    metrics.totalQueryTime += queryInfo.duration;
    
    // Track slow queries
    if (queryInfo.duration > config.slowQueryThreshold) {
      const slowQuery = {
        text: queryInfo.text.substring(0, 100) + (queryInfo.text.length > 100 ? '...' : ''),
        duration: queryInfo.duration,
        timestamp: new Date().toISOString()
      };
      
      metrics.slowQueries.unshift(slowQuery);
      if (metrics.slowQueries.length > config.maxSlowQueries) {
        metrics.slowQueries.pop();
      }
    }
  } else {
    metrics.failedQueries++;
    
    // Track errors by code
    const errorCode = queryInfo.error?.code || 'unknown';
    metrics.errorsByCode[errorCode] = (metrics.errorsByCode[errorCode] || 0) + 1;
    
    // Track last errors
    const errorInfo = {
      code: errorCode,
      message: queryInfo.error?.message || 'Unknown error',
      query: queryInfo.text.substring(0, 100) + (queryInfo.text.length > 100 ? '...' : ''),
      timestamp: new Date().toISOString()
    };
    
    metrics.lastErrors.unshift(errorInfo);
    if (metrics.lastErrors.length > config.maxErrors) {
      metrics.lastErrors.pop();
    }
  }
  
  // Log metrics to file in production
  if (config.logToFile) {
    logMetricsToFile();
  }
}

/**
 * Record a connection attempt
 * @param {boolean} success - Whether the connection attempt was successful
 * @param {Object} [error] - Error object if connection failed
 */
function recordConnection(success, error = null) {
  metrics.connectionAttempts++;
  
  if (!success) {
    metrics.connectionFailures++;
    
    // Track connection errors
    if (error) {
      const errorCode = error.code || 'unknown';
      metrics.errorsByCode[errorCode] = (metrics.errorsByCode[errorCode] || 0) + 1;
      
      const errorInfo = {
        code: errorCode,
        message: error.message || 'Unknown connection error',
        query: 'CONNECTION',
        timestamp: new Date().toISOString()
      };
      
      metrics.lastErrors.unshift(errorInfo);
      if (metrics.lastErrors.length > config.maxErrors) {
        metrics.lastErrors.pop();
      }
    }
  }
}

/**
 * Get current database metrics
 * @returns {Object} Current metrics
 */
function getMetrics() {
  return {
    ...metrics,
    averageQueryTime: metrics.successfulQueries > 0 
      ? metrics.totalQueryTime / metrics.successfulQueries 
      : 0,
    successRate: metrics.totalQueries > 0 
      ? (metrics.successfulQueries / metrics.totalQueries) * 100 
      : 0,
    connectionSuccessRate: metrics.connectionAttempts > 0 
      ? ((metrics.connectionAttempts - metrics.connectionFailures) / metrics.connectionAttempts) * 100 
      : 0,
    metricsAge: Date.now() - metrics.lastReset
  };
}

/**
 * Reset all metrics
 */
function resetMetrics() {
  metrics = {
    totalQueries: 0,
    successfulQueries: 0,
    failedQueries: 0,
    totalQueryTime: 0,
    slowQueries: [],
    errorsByCode: {},
    lastErrors: [],
    connectionAttempts: 0,
    connectionFailures: 0,
    lastReset: Date.now()
  };
  
  console.log('Database metrics have been reset');
}

/**
 * Log metrics to file
 */
function logMetricsToFile() {
  try {
    const dir = path.dirname(config.logPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(
      config.logPath, 
      JSON.stringify(getMetrics(), null, 2)
    );
  } catch (error) {
    console.error('Error writing database metrics to file:', error);
  }
}

// Create a default export object with all the functions
const dbMonitor = {
  recordQuery,
  recordConnection,
  getMetrics,
  resetMetrics
};

export default dbMonitor; 