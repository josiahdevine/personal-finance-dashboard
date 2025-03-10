// Script to verify database connectivity
require('dotenv').config();
const { Pool } = require('pg');

console.log('Database Connection Verification Script');
console.log('======================================');

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testConnection() {
  let client;
  
  try {
    console.log('Connecting to database...');
    console.log(`Connection string: ${process.env.DATABASE_URL.replace(/:[^:]*@/, ':****@')}`);
    
    client = await pool.connect();
    console.log('✅ Successfully connected to the database');
    
    // Try a simple query
    console.log('Testing query execution...');
    const result = await client.query('SELECT NOW() as current_time');
    console.log(`✅ Query successful. Current database time: ${result.rows[0].current_time}`);
    
    // Check for existing tables
    console.log('Checking for existing tables...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    if (tablesResult.rows.length === 0) {
      console.log('❌ No tables found in the database');
    } else {
      console.log('✅ Found the following tables:');
      tablesResult.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.error('   The database host could not be found. Check your DATABASE_URL.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('   Connection was refused. Make sure the database server is running.');
    } else if (error.code === '28P01') {
      console.error('   Authentication failed. Check your username and password.');
    } else if (error.code === '3D000') {
      console.error('   Database does not exist. Check the database name in your connection string.');
    }
    
  } finally {
    if (client) {
      client.release();
      console.log('Connection released');
    }
    await pool.end();
    console.log('Connection pool closed');
  }
}

testConnection(); 