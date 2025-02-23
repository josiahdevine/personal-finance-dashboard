// server/db.js
const { Pool } = require('pg');
const config = require('./config/' + (process.env.NODE_ENV || 'development'));
require('dotenv').config();

const pool = new Pool({
  connectionString: config.database.url,
  ssl: config.database.ssl,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection not established
});

// Test the connection
pool.on('connect', () => {
  console.log('Database connection established successfully');
  console.log('Environment:', process.env.NODE_ENV || 'development');
  console.log('SSL enabled:', !!config.database.ssl);
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  console.error('Connection details:', {
    environment: process.env.NODE_ENV || 'development',
    ssl: !!config.database.ssl,
    error: err.message
  });
  process.exit(-1);
});

// Export query helper function
module.exports = {
  query: (text, params) => {
    console.log('Executing query:', text);
    return pool.query(text, params);
  },
  pool
};