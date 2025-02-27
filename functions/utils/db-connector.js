/**
 * Database Connector Utility for Neon Tech PostgreSQL
 * This module provides standardized database connection handling for Netlify Functions
 */

const { Pool } = require('pg');

// Pool instance to be reused across function invocations
let pool;

/**
 * Get a database connection pool
 * @returns {Pool} PostgreSQL connection pool
 */
function getDbPool() {
  if (pool) {
    return pool;
  }

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  // Create a new connection pool if one doesn't exist
  const dbConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: { 
      rejectUnauthorized: false // Required for Neon Tech DB
    },
    max: 10, // Maximum number of clients in the pool
    idleTimeoutMillis: 60000, // How long a client is allowed to remain idle before being closed
    connectionTimeoutMillis: 10000, // How long to wait for a connection
    query_timeout: 30000, // Query timeout in ms
    keepAlive: true // Enable TCP keepalive
  };

  // Log connection attempt (without sensitive info)
  console.log('Creating Neon DB connection pool:', {
    ssl: !!dbConfig.ssl,
    hasConnectionString: true,
    maxConnections: dbConfig.max,
    idleTimeout: dbConfig.idleTimeoutMillis,
    environment: process.env.NODE_ENV || 'development'
  });

  pool = new Pool(dbConfig);
  
  // Add error handler to the pool
  pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    // Try to create a new pool on next request
    pool = null;
  });

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

  while (retries < maxRetries) {
    const pool = getDbPool();
    const start = Date.now();
    let client;

    try {
      client = await pool.connect();
      const result = await client.query(text, params);
      const duration = Date.now() - start;
      
      console.log('Executed query', {
        text,
        rows: result.rowCount,
        duration: `${duration}ms`,
        attempt: retries + 1
      });
      
      return result;
    } catch (error) {
      lastError = error;
      console.error(`Database query error (attempt ${retries + 1}):`, error.message, {
        query: text,
        params: JSON.stringify(params)
      });

      // If the error is related to the connection, reset the pool
      if (error.code === 'ECONNREFUSED' || error.code === '57P01' || error.code === '57P02') {
        pool = null;
      }

      retries++;
      if (retries < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
      }
    } finally {
      if (client) {
        client.release();
      }
    }
  }

  throw lastError;
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

module.exports = {
  getDbPool,
  query,
  checkDbStatus,
  verifyTableSchema,
  createTableIfNotExists
}; 