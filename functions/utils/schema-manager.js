/**
 * Database Schema Manager Utility for Neon Tech PostgreSQL
 * This module provides schema management and migration functionality
 */

const dbConnector = require('./db-connector');

// Schema definitions for all tables
const tableSchemas = {
  // Schema version tracking table
  schema_versions: {
    id: 'SERIAL PRIMARY KEY',
    table_name: 'VARCHAR(100) NOT NULL',
    version: 'INTEGER NOT NULL',
    applied_at: 'TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP',
    details: 'TEXT'
  },
  
  // User accounts table
  users: {
    id: 'VARCHAR(100) PRIMARY KEY',
    email: 'VARCHAR(255) UNIQUE NOT NULL',
    display_name: 'VARCHAR(100)',
    created_at: 'TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP',
    updated_at: 'TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP',
    last_login: 'TIMESTAMP WITH TIME ZONE'
  },
  
  // Salary entries table
  salary_entries: {
    id: 'VARCHAR(36) PRIMARY KEY',
    user_id: 'VARCHAR(100) NOT NULL',
    user_profile_id: 'VARCHAR(50) NOT NULL',
    date: 'DATE NOT NULL',
    gross_pay: 'DECIMAL(10, 2) NOT NULL',
    net_pay: 'DECIMAL(10, 2) NOT NULL',
    taxes: 'DECIMAL(10, 2) NOT NULL',
    deductions: 'DECIMAL(10, 2) NOT NULL',
    details: 'JSONB',
    created_at: 'TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP',
    updated_at: 'TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP'
  },
  
  // Financial goals table
  financial_goals: {
    id: 'SERIAL PRIMARY KEY',
    user_id: 'VARCHAR(100) NOT NULL',
    name: 'VARCHAR(200) NOT NULL',
    target_amount: 'DECIMAL(12, 2) NOT NULL',
    current_amount: 'DECIMAL(12, 2) DEFAULT 0',
    start_date: 'TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP',
    target_date: 'TIMESTAMP WITH TIME ZONE',
    category: 'VARCHAR(100) DEFAULT \'General\'',
    description: 'TEXT',
    status: 'VARCHAR(50) DEFAULT \'active\'',
    created_at: 'TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP',
    updated_at: 'TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP'
  },
  
  // Plaid accounts table
  plaid_accounts: {
    id: 'VARCHAR(100) PRIMARY KEY',
    user_id: 'VARCHAR(100) NOT NULL',
    item_id: 'VARCHAR(100) NOT NULL',
    institution_id: 'VARCHAR(100)',
    institution_name: 'VARCHAR(255)',
    account_name: 'VARCHAR(255)',
    account_type: 'VARCHAR(50)',
    account_subtype: 'VARCHAR(50)',
    mask: 'VARCHAR(10)',
    balance_available: 'DECIMAL(12, 2)',
    balance_current: 'DECIMAL(12, 2)',
    balance_limit: 'DECIMAL(12, 2)',
    balance_iso_currency_code: 'VARCHAR(10) DEFAULT \'USD\'',
    last_updated: 'TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP',
    created_at: 'TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP',
    updated_at: 'TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP',
    is_active: 'BOOLEAN DEFAULT TRUE'
  },
  
  // Plaid transactions table
  plaid_transactions: {
    id: 'VARCHAR(100) PRIMARY KEY',
    user_id: 'VARCHAR(100) NOT NULL',
    account_id: 'VARCHAR(100) NOT NULL',
    transaction_id: 'VARCHAR(100) NOT NULL',
    category_id: 'VARCHAR(100)',
    category: 'VARCHAR(255)',
    subcategory: 'VARCHAR(255)',
    transaction_type: 'VARCHAR(50)',
    name: 'VARCHAR(255)',
    merchant_name: 'VARCHAR(255)',
    amount: 'DECIMAL(12, 2) NOT NULL',
    iso_currency_code: 'VARCHAR(10) DEFAULT \'USD\'',
    date: 'DATE NOT NULL',
    pending: 'BOOLEAN DEFAULT FALSE',
    account_owner: 'VARCHAR(255)',
    payment_channel: 'VARCHAR(100)',
    payment_method: 'VARCHAR(100)',
    transaction_code: 'VARCHAR(100)',
    location: 'JSONB',
    website: 'VARCHAR(255)',
    authorized_date: 'DATE',
    authorized_datetime: 'TIMESTAMP WITH TIME ZONE',
    datetime: 'TIMESTAMP WITH TIME ZONE',
    payment_meta: 'JSONB',
    personal_finance_category: 'JSONB',
    created_at: 'TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP',
    updated_at: 'TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP'
  }
};

/**
 * Create schema_versions table if it doesn't exist
 * @returns {Promise<boolean>} Success status
 */
async function initSchemaVersionsTable() {
  try {
    // Check if the schema_versions table exists
    const checkResult = await dbConnector.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'schema_versions'
      );
    `);
    
    // If it doesn't exist, create it
    if (!checkResult.rows[0].exists) {
      console.log('Creating schema_versions table');
      await dbConnector.query(`
        CREATE TABLE schema_versions (
          id SERIAL PRIMARY KEY,
          table_name VARCHAR(100) NOT NULL,
          version INTEGER NOT NULL,
          applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          details TEXT
        );
      `);
      
      // Insert initial version records for all tables
      for (const tableName of Object.keys(tableSchemas)) {
        if (tableName !== 'schema_versions') {
          await dbConnector.query(`
            INSERT INTO schema_versions (table_name, version, details)
            VALUES ($1, 0, 'Initial schema version tracking entry')
          `, [tableName]);
        }
      }
      
      return true;
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing schema_versions table:', error.message);
    return false;
  }
}

/**
 * Get the current schema version for a table
 * @param {string} tableName - Name of the table
 * @returns {Promise<number>} Current version number
 */
async function getTableVersion(tableName) {
  try {
    // Ensure schema_versions table exists
    await initSchemaVersionsTable();
    
    // Get current version
    const result = await dbConnector.query(
      'SELECT version FROM schema_versions WHERE table_name = $1 ORDER BY id DESC LIMIT 1',
      [tableName]
    );
    
    if (result.rows.length === 0) {
      // Insert initial version if not found
      await dbConnector.query(
        'INSERT INTO schema_versions (table_name, version, details) VALUES ($1, 0, $2)',
        [tableName, 'Initial version']
      );
      return 0;
    }
    
    return parseInt(result.rows[0].version, 10);
  } catch (error) {
    console.error(`Error getting version for table ${tableName}:`, error.message);
    return 0;
  }
}

/**
 * Update schema version for a table
 * @param {string} tableName - Name of the table
 * @param {number} version - New version number
 * @param {string} details - Details about the version change
 * @returns {Promise<boolean>} Success status
 */
async function updateTableVersion(tableName, version, details) {
  try {
    await dbConnector.query(
      'INSERT INTO schema_versions (table_name, version, details) VALUES ($1, $2, $3)',
      [tableName, version, details]
    );
    return true;
  } catch (error) {
    console.error(`Error updating version for table ${tableName}:`, error.message);
    return false;
  }
}

/**
 * Create a table if it doesn't exist using the defined schema
 * @param {string} tableName - Name of the table to create
 * @returns {Promise<boolean>} Success status
 */
async function createTableIfNotExists(tableName) {
  try {
    // Skip if this is the schema_versions table and we're called recursively
    if (tableName === 'schema_versions') {
      return true;
    }

    const schema = tableSchemas[tableName];
    if (!schema) {
      console.error(`No schema defined for table ${tableName}`);
      return false;
    }

    // Check if table exists
    const tableExists = await dbConnector.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = $1
      );
    `, [tableName]);

    if (!tableExists.rows[0].exists) {
      console.log(`Creating table ${tableName}`);
      
      // Build CREATE TABLE statement
      const columnDefinitions = Object.entries(schema)
        .map(([column, type]) => `${column} ${type}`)
        .join(', ');
      
      const createTableQuery = `
        CREATE TABLE ${tableName} (
          ${columnDefinitions}
        );
      `;
      
      await dbConnector.query(createTableQuery);
      
      // Update version to 1 for newly created table
      await updateTableVersion(tableName, 1, 'Initial table creation');
      return true;
    }
    
    return true;
  } catch (error) {
    console.error(`Error creating table ${tableName}:`, error.message);
    return false;
  }
}

/**
 * Initialize and update all database tables
 * @returns {Promise<object>} Status of all table initializations
 */
async function initializeDatabase() {
  const results = {};
  
  try {
    // First ensure schema_versions table exists
    await initSchemaVersionsTable();
    
    // Create all tables if they don't exist
    for (const tableName of Object.keys(tableSchemas)) {
      if (tableName !== 'schema_versions') {
        results[tableName] = await createTableIfNotExists(tableName);
        
        // Verify or update schema if table exists
        await dbConnector.verifyTableSchema(tableName, tableSchemas[tableName]);
      }
    }
    
    return {
      success: true,
      details: results
    };
  } catch (error) {
    console.error('Error initializing database:', error.message);
    return {
      success: false,
      error: error.message,
      details: results
    };
  }
}

/**
 * Verify and update all database tables
 * Called when the application starts or when a function first connects to the database
 */
async function verifyAllSchemas() {
  try {
    const results = {};
    
    // Ensure schema_versions table exists
    await initSchemaVersionsTable();
    
    // Verify all schemas
    for (const [tableName, schema] of Object.entries(tableSchemas)) {
      if (tableName !== 'schema_versions') {
        // Create table if it doesn't exist
        await createTableIfNotExists(tableName);
        
        // Verify and update schema
        const result = await dbConnector.verifyTableSchema(tableName, schema);
        results[tableName] = result;
      }
    }
    
    return {
      success: true,
      details: results
    };
  } catch (error) {
    console.error('Error verifying all schemas:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  tableSchemas,
  initializeDatabase,
  verifyAllSchemas,
  getTableVersion,
  updateTableVersion,
  createTableIfNotExists
}; 