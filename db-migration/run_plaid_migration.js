require('dotenv').config();
const fs = require('fs');
const { Pool } = require('pg');

// Read the SQL file content
const sqlScript = fs.readFileSync('./plaid_tables_migration.sql', 'utf8');

// Create a connection pool to the Neon PostgreSQL database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Only set this in development, not production
  }
});

async function runPlaidMigration() {
  const client = await pool.connect();
  try {
    console.log('Connected to Neon Tech PostgreSQL database');
    console.log('Running Plaid migration script...');
    
    // Execute the SQL commands
    await client.query(sqlScript);
    
    console.log('Plaid migration completed successfully!');
    
    // Verify the tables were created
    const tables = ['plaid_items', 'plaid_accounts', 'account_balances', 'balance_history', 
                     'plaid_transactions', 'plaid_sync_cursor', 'plaid_webhooks'];
    
    for (const table of tables) {
      const res = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `, [table]);
      
      console.log(`Table ${table} exists: ${res.rows[0].exists}`);
      
      if (res.rows[0].exists) {
        // Get column info for the table
        const columnRes = await client.query(`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = $1
          ORDER BY ordinal_position;
        `, [table]);
        
        console.log(`\nColumns for ${table}:`);
        console.table(columnRes.rows);
      }
    }
    
    console.log('\nIndexes created:');
    const indexRes = await client.query(`
      SELECT indexname, tablename
      FROM pg_indexes
      WHERE schemaname = 'public' AND indexname LIKE 'idx_%'
      ORDER BY tablename, indexname;
    `);
    console.table(indexRes.rows);
    
  } catch (err) {
    console.error('Error executing Plaid migration:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

runPlaidMigration(); 