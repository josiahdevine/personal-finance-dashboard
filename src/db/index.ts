import { neon, neonConfig } from '@neondatabase/serverless';

// Enable connection caching for better performance
neonConfig.fetchConnectionCache = true;

// Create a direct SQL executor using neon
export const sql = neon(process.env.REACT_APP_NEON_DATABASE_URL!);

// Helper function to execute queries with error handling
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<T[]> {
  const start = Date.now();
  try {
    const res = await sql(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.length });
    return res as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Helper function to execute a single-result query
export async function queryOne<T = any>(
  text: string,
  params?: any[]
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] || null;
}

// Transaction helper
export async function transaction<T>(
  callback: (client: typeof sql) => Promise<T>
): Promise<T> {
  try {
    await sql('BEGIN');
    const result = await callback(sql);
    await sql('COMMIT');
    return result;
  } catch (error) {
    await sql('ROLLBACK');
    throw error;
  }
}

// Health check function
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await sql('SELECT NOW()');
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
} 