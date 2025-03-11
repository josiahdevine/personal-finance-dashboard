import { Pool, PoolConfig, QueryResult, QueryResultRow } from 'pg';
import logger from '../utils/logger';

// Default connection config
const defaultConfig: PoolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'finance_app',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: parseInt(process.env.DB_POOL_SIZE || '20'),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Create connection pool
const pool = new Pool(defaultConfig);

// Event handlers
pool.on('connect', () => {
  logger.debug('Database', 'New client connected to database');
});

pool.on('error', (err) => {
  logger.error('Database', 'Unexpected database error on idle client', err);
  process.exit(-1);
});

/**
 * Execute a query with parameters
 */
async function query<T extends QueryResultRow = any>(
  text: string,
  params: any[] = []
): Promise<QueryResult<T>> {
  const start = Date.now();
  
  try {
    const result = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    
    // Log query for debugging in development
    logger.debug(
      'Database',
      `Query executed in ${duration}ms: ${text.substring(0, 80)}${text.length > 80 ? '...' : ''}`,
      { rows: result.rowCount, duration }
    );
    
    return result;
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown database error');
    logger.error('Database', `Query failed: ${text.substring(0, 100)}`, err);
    throw err;
  }
}

/**
 * Get a client from the pool (for transactions)
 */
async function getClient() {
  const client = await pool.connect();
  const originalQuery = client.query.bind(client);
  
  // We'll only override the simple query method
  const wrappedQuery = async (text: string, params: any[] = []) => {
    const start = Date.now();
    
    try {
      const result = await originalQuery(text, params);
      const duration = Date.now() - start;
      
      logger.debug(
        'Database',
        `Client query executed in ${duration}ms: ${text.substring(0, 80)}${text.length > 80 ? '...' : ''}`,
        { rows: result.rowCount, duration }
      );
      
      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown database error');
      logger.error('Database', `Client query failed: ${text.substring(0, 100)}`, err);
      throw err;
    }
  };
  
  // Add the wrapped query method without disrupting other overloads
  // Note: This is a hack to avoid TypeScript errors but still provides logging
  client.query = wrappedQuery as typeof client.query;
  
  return client;
}

export const db = {
  query,
  getClient,
  pool
};

export default db; 