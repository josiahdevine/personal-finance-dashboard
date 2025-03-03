/**
 * Example database configuration for Neon Postgres
 * Copy this file to database.js and update with your credentials
 */

module.exports = {
  // You can use either a connection string or individual parameters
  
  // Option 1: Connection string (recommended)
  connectionString: process.env.DATABASE_URL || 'postgres://username:password@hostname/database?sslmode=require',
  
  // Option 2: Individual parameters
  /*
  host: process.env.DB_HOST || 'your-neon-hostname.neon.tech',
  database: process.env.DB_NAME || 'neondb',
  user: process.env.DB_USER || 'username',
  password: process.env.DB_PASSWORD || 'password',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  */
  
  // Connection pool settings
  max: 10,                         // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,        // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 10000,  // How long to wait for a connection
  
  // SSL settings (required for Neon)
  ssl: {
    rejectUnauthorized: process.env.NODE_ENV === 'production' ? false : false
  }
}; 