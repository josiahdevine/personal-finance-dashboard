import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create a connection pool
export const pool = new Pool({
  connectionString: process.env.REACT_APP_NEON_DATABASE_URL,
  ssl: true,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait before timing out when connecting a new client
});

// Helper function for single-row queries
export async function queryOne<T>(text: string, params: any[] = []): Promise<T | null> {
  const { rows } = await pool.query(text, params);
  return rows[0] || null;
}

// Helper function for multiple-row queries
export async function query<T>(text: string, params: any[] = []): Promise<T[]> {
  const { rows } = await pool.query(text, params);
  return rows;
}

// Helper function for transactions
export async function transaction<T>(
  callback: (client: any) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

// Error handling for the pool
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Cleanup function to be called when shutting down
export async function closePool(): Promise<void> {
  await pool.end();
} 