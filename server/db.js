// server/db.js
const { Pool } = require('pg');
const config = require('./config/' + (process.env.NODE_ENV || 'development'));
require('dotenv').config();

// Create connection pool with Neon Tech optimized settings
const createPool = () => {
    const pool = new Pool({
        connectionString: config.database.url,
        ssl: config.database.ssl,
        max: 10, // Reduced max connections for better stability
        idleTimeoutMillis: 60000, // Increased idle timeout
        connectionTimeoutMillis: 10000,
        query_timeout: 30000,
        keepAlive: true // Enable TCP keepalive
    });

    // Log connection events
    pool.on('connect', () => {
        console.log('Database connection established successfully');
        console.log('Connection details:', {
            environment: process.env.NODE_ENV || 'development',
            ssl: !!config.database.ssl,
            connectionTimeout: pool.options.connectionTimeoutMillis,
            queryTimeout: pool.options.query_timeout,
            maxConnections: pool.options.max
        });
    });

    pool.on('error', (err) => {
        console.error('Unexpected error on idle client', err);
        console.error('Connection details:', {
            environment: process.env.NODE_ENV || 'development',
            ssl: !!config.database.ssl,
            error: err.message,
            code: err.code,
            detail: err.detail,
            hint: err.hint
        });

        // Create a new pool if the current one has an error
        if (process.env.NODE_ENV === 'production') {
            console.log('Attempting to create new pool after error');
            return createPool();
        }
    });

    return pool;
};

let pool = createPool();

// Wrapper for query execution with retries and connection check
const executeQuery = async (text, params, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            // Test the connection before executing the query
            if (!pool._clients || pool._clients.length === 0) {
                console.log('No active clients, creating new pool');
                pool = createPool();
            }

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

            // Handle specific Neon Tech error codes
            if (error.code === '57P01' || error.code === '57P02' || error.code === '57P03') {
                console.log('Connection terminated, creating new pool');
                pool = createPool();
            }

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