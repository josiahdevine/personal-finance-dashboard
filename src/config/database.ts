import { neon, neonConfig } from '@neondatabase/serverless';
import { Pool } from 'pg';

neonConfig.fetchConnectionCache = true;

const pool = new Pool({
  connectionString: process.env.REACT_APP_NEON_DATABASE_URL,
  ssl: true,
});

export const sql = neon(process.env.REACT_APP_NEON_DATABASE_URL!);
export { pool }; 