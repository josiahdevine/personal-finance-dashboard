require('dotenv').config();
const fs = require('fs');
const { Pool } = require('pg');

// Read the SQL file content
const sqlScript = fs.readFileSync('./salary_table_migration.sql', 'utf8');

// Create a connection pool to the Neon PostgreSQL database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Only set this in development, not production
  }
});

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('Connected to Neon Tech PostgreSQL database');
    console.log('Running migration script...');
    
    // Execute the SQL commands
    await client.query(sqlScript);
    
    console.log('Migration completed successfully!');
    
    // Verify the columns were added
    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'salary_entries'
      ORDER BY ordinal_position;
    `);
    
    console.log('Current salary_entries table schema:');
    console.table(res.rows);
  } catch (err) {
    console.error('Error executing migration:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration(); 