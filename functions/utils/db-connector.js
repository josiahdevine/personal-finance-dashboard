/**
 * Database Connector Utility for Neon Tech PostgreSQL
 * This module provides standardized database connection handling for Netlify Functions
 */

import { Pool } from 'pg';
import dbMonitor from './db-monitor.js';
import queryOptimizer from './query-optimizer.js';

// Pool instance to be reused across function invocations
let pool = null;

// Configuration
const config = {
  enableQueryOptimization: process.env.ENABLE_QUERY_OPTIMIZATION === 'true',
  optimizeSelectQueriesOnly: true
};

// Get or create a database connection pool
function getDbPool() {
  if (!pool) {
    try {
      pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      // Add error handler to prevent connection issues from crashing the app
      pool.on('error', (err) => {
        console.error('Unexpected error on idle client', err);
        dbMonitor.recordConnection(false, err);
        process.exit(-1);
      });
      
      // Record successful pool creation
      dbMonitor.recordConnection(true);
      console.log('Database pool created successfully');
    } catch (error) {
      console.error('Error creating database pool:', error);
      dbMonitor.recordConnection(false, error);
      throw error;
    }
  }
  return pool;
}

/**
 * Execute a database query with retries
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @param {number} maxRetries - Maximum number of retry attempts
 * @returns {Promise<object>} Query result
 */
async function query(text, params = [], maxRetries = 3) {
  let retries = 0;
  let lastError;
  let client;
  let pool = getDbPool();
  
  // Check if query should be optimized
  let shouldOptimize = config.enableQueryOptimization && 
    (!config.optimizeSelectQueriesOnly || text.trim().toUpperCase().startsWith('SELECT'));
  
  // Store original query for optimization analysis
  const originalQuery = text;

  while (retries < maxRetries) {
    const start = Date.now();

    try {
      client = await pool.connect();
      const result = await client.query(text, params);
      const duration = Date.now() - start;
      
      console.log('Executed query', {
        text,
        rows: result.rowCount,
        duration: `${duration}ms`,
        attempt: retries + 1,
        success: true
      });
      
      // Record successful query
      dbMonitor.recordQuery({
        text,
        duration,
        success: true
      });
      
      // Analyze query for optimization if enabled
      if (shouldOptimize) {
        const analysis = queryOptimizer.analyzeQuery(originalQuery, duration);
        
        // Log optimization suggestions if any
        if (analysis.analyzed && analysis.suggestions && analysis.suggestions.length > 0) {
          console.log('Query optimization suggestions:', {
            query: originalQuery.substring(0, 100) + (originalQuery.length > 100 ? '...' : ''),
            duration,
            suggestions: analysis.suggestions
          });
        }
      }
      
      return result;
    } catch (error) {
      lastError = error;
      const duration = Date.now() - start;
      
      console.error('Database query error:', {
        message: error.message,
        code: error.code,
        detail: error.detail,
        hint: error.hint,
        position: error.position,
        query: text,
        params: JSON.stringify(params),
        attempt: retries + 1,
        stack: error.stack
      });
      
      // Record failed query
      dbMonitor.recordQuery({
        text,
        duration,
        success: false,
        error
      });

      // If the error is related to the connection, reset the pool
      if (error.code === 'ECONNREFUSED' || 
          error.code === '57P01' || // admin shutdown
          error.code === '57P02' || // crash shutdown
          error.code === '08006' || // connection failure
          error.code === '08001' || // unable to establish connection
          error.code === '08004') { // rejected connection
        console.log('Connection error detected, resetting pool');
        pool = getDbPool(); // Reset pool by getting a new instance
      }

      retries++;
      if (retries < maxRetries) {
        console.log(`Retrying query (attempt ${retries + 1} of ${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * retries)); // Exponential backoff
      }
    } finally {
      if (client) {
        client.release();
      }
    }
  }

  throw new Error(`Query failed after ${maxRetries} attempts. Last error: ${lastError.message}`);
}

/**
 * Create a table if it doesn't exist
 * @param {string} tableName - Name of table to create
 * @param {object} columns - Object describing columns and their types
 * @returns {Promise<boolean>} True if table was created or already exists
 */
async function createTableIfNotExists(tableName, columns) {
  const columnDefinitions = Object.entries(columns)
    .map(([name, type]) => `${name} ${type}`)
    .join(',\n  ');

  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS ${tableName} (
      ${columnDefinitions}
    );
  `;

  try {
    await query(createTableQuery);
    console.log(`Table ${tableName} created or already exists`);
    return true;
  } catch (error) {
    console.error(`Error creating table ${tableName}:`, error.message);
    throw error;
  }
}

/**
 * Check database connectivity and table existence
 * @returns {Promise<object>} Database status information
 */
async function checkDbStatus() {
  try {
    // Test basic connectivity
    const connectionResult = await query('SELECT NOW() as current_time');
    
    // Check for tables existence
    const tablesResult = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    return {
      connected: true,
      currentTime: connectionResult.rows[0].current_time,
      tables: tablesResult.rows.map(row => row.table_name)
    };
  } catch (error) {
    console.error('Database status check failed:', error.message);
    return {
      connected: false,
      error: error.message
    };
  }
}

/**
 * Verify table schema and create missing columns if necessary
 * @param {string} tableName - Name of table to verify
 * @param {object} requiredColumns - Object describing required columns and their types
 * @returns {Promise<object>} Schema verification result
 */
async function verifyTableSchema(tableName, requiredColumns) {
  try {
    // First, ensure the table exists
    await createTableIfNotExists(tableName, requiredColumns);
    
    // Get existing columns
    const columnsResult = await query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1;
    `, [tableName]);
    
    const existingColumns = columnsResult.rows.reduce((acc, row) => {
      acc[row.column_name] = row.data_type;
      return acc;
    }, {});
    
    // Identify missing columns
    const missingColumns = [];
    Object.entries(requiredColumns).forEach(([colName, colType]) => {
      if (!existingColumns[colName]) {
        missingColumns.push({ name: colName, type: colType });
      }
    });
    
    // Create missing columns if any
    if (missingColumns.length > 0) {
      const alterTableQueries = missingColumns.map(col => 
        `ALTER TABLE ${tableName} ADD COLUMN IF NOT EXISTS ${col.name} ${col.type};`
      );
      
      // Execute all alter table queries
      for (const query of alterTableQueries) {
        await query(query);
      }
      
      console.log(`Added ${missingColumns.length} missing columns to ${tableName}`);
    }
    
    return {
      success: true,
      tableName,
      existingColumns: Object.keys(existingColumns),
      addedColumns: missingColumns.map(col => col.name)
    };
  } catch (error) {
    console.error(`Error verifying schema for ${tableName}:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get database metrics and optimization statistics
 * @returns {Promise<object>} Database metrics, status, and optimization stats
 */
async function getDbMetrics() {
  try {
    // Get basic database status
    const status = await checkDbStatus();
    
    // Get monitoring metrics
    const metrics = dbMonitor.getMetrics();
    
    // Get optimization statistics if enabled
    const optimizationStats = config.enableQueryOptimization 
      ? queryOptimizer.getOptimizationStats() 
      : { enabled: false };
    
    // Get pool statistics
    const poolStats = pool ? {
      totalCount: pool.totalCount,
      idleCount: pool.idleCount,
      waitingCount: pool.waitingCount
    } : null;
    
    return {
      status,
      metrics,
      optimization: optimizationStats,
      poolStats,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting database metrics:', error);
    return {
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Enable or disable query optimization
 * @param {boolean} enable - Whether to enable query optimization
 */
function setQueryOptimization(enable) {
  config.enableQueryOptimization = !!enable;
  console.log(`Query optimization ${config.enableQueryOptimization ? 'enabled' : 'disabled'}`);
  
  // Reset optimization stats when toggling
  if (config.enableQueryOptimization) {
    queryOptimizer.resetOptimizationStats();
  }
  
  return { enabled: config.enableQueryOptimization };
}

// Close the connection pool
function closePool() {
  if (pool) {
    pool.end();
    pool = null;
  }
}

// Export database functions
export {
  getDbPool,
  query,
  checkDbStatus,
  verifyTableSchema,
  createTableIfNotExists,
  getDbMetrics,
  setQueryOptimization,
  closePool
}; 