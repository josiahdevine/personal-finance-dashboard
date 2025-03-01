/**
 * Database Connector Utility for Neon Tech PostgreSQL
 * This module provides standardized database connection handling for Netlify Functions
 */

const { Pool } = require('pg');

// Pool instance to be reused across function invocations
let pool = null;

// Get or create a database connection pool
function getDbPool() {
  if (!pool) {
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
      process.exit(-1);
    });
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
      
      return result;
    } catch (error) {
      lastError = error;
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

// Close the connection pool
function closePool() {
  if (pool) {
    pool.end();
    pool = null;
  }
}

// Export database functions
module.exports = {
  getDbPool,
  query,
  checkDbStatus,
  verifyTableSchema,
  createTableIfNotExists,
  closePool
}; 