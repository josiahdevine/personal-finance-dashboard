// server/db.js
const { Pool } = require('pg');
const config = require('./config/' + (process.env.NODE_ENV || 'development'));
require('dotenv').config();

// Create connection pool with retries
const createPool = () => {
    const pool = new Pool({
        connectionString: config.database.url,
        ssl: config.database.ssl,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
        query_timeout: 10000
    });

    // Log connection events
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

        // Don't exit the process in production
        if (process.env.NODE_ENV !== 'production') {
            process.exit(-1);
        }
    });

    return pool;
};

const pool = createPool();

// Wrapper for query execution with retries
const executeQuery = async (text, params, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            console.log('Executing query:', {
                text,
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

            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
        }
    }
};

module.exports = {
    query: executeQuery,
    pool
};