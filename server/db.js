// server/db.js
const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load environment-specific .env file
if (process.env.NODE_ENV === 'test') {
    dotenv.config({ path: '.env.test' });
} else {
    dotenv.config();
}

// Load database configuration (direct from environment or config file)
const dbConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? 
        { rejectUnauthorized: false } : 
        { rejectUnauthorized: false }, // Always use SSL for Neon DB
    max: process.env.NODE_ENV === 'test' ? 5 : 10, // Fewer connections for test environment
    idleTimeoutMillis: 60000,
    connectionTimeoutMillis: 10000,
    query_timeout: 30000,
    keepAlive: true
};

// Log DB connection attempt (no sensitive info)
console.log('Attempting database connection:', {
    environment: process.env.NODE_ENV || 'development',
    ssl: !!dbConfig.ssl,
    url: process.env.DATABASE_URL ? 'URL provided' : 'No URL in env',
    postgres_version: 'Neon PostgreSQL'
});

// Create connection pool
const pool = new Pool(dbConfig);

// Log connection events
pool.on('connect', () => {
    console.log('Database connection established successfully');
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
});

// Wrapper for query execution with retries
const executeQuery = async (text, params, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            console.log('Executing query:', {
                text: text.substring(0, 50) + '...',
                params: params ? 'present' : 'none',
                attempt: i + 1
            });

            const result = await pool.query(text, params);
            return result;
        } catch (error) {
            console.error('Query error:', {
                message: error.message,
                code: error.code,
                attempt: i + 1,
                remaining: retries - i - 1
            });

            if (i === retries - 1) throw error;

            // Exponential backoff before retrying
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
        }
    }
};

module.exports = {
    query: executeQuery,
    pool
};