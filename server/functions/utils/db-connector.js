const { Pool } = require('pg');
const { createLogger } = require('./logger');

const logger = createLogger('db-connector');

let pool = null;

async function getDbPool() {
    if (!pool) {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false
            },
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });

        // Test the connection
        try {
            const client = await pool.connect();
            logger.info('Database connection successful');
            client.release();
        } catch (error) {
            logger.error('Error connecting to database:', error);
            throw error;
        }
    }
    return pool;
}

async function query(text, params) {
    const pool = await getDbPool();
    try {
        const start = Date.now();
        const result = await pool.query(text, params);
        const duration = Date.now() - start;
        logger.debug('Executed query', { text, duration, rows: result.rowCount });
        return result;
    } catch (error) {
        logger.error('Database query error:', error);
        throw error;
    }
}

async function closePool() {
    if (pool) {
        await pool.end();
        pool = null;
        logger.info('Database pool closed');
    }
}

module.exports = {
    getDbPool,
    query,
    closePool
}; 