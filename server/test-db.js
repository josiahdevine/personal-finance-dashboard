// test-db.js
require('dotenv').config();
const { Pool } = require('pg');

console.log('Database URL from env:', process.env.DATABASE_URL ? 'Present (not shown for security)' : 'Missing');
console.log('NODE_ENV:', process.env.NODE_ENV);

// Try three different connection configurations
async function testConnections() {
  const configs = [
    {
      name: 'From .env file',
      config: {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
      }
    },
    {
      name: 'Original connection string',
      config: {
        connectionString: 'postgres://josiah:WPg5dfnvjCkM@ep-tidy-pine-a1cqk8l9.us-east-2.aws.neon.tech/neondb?sslmode=require',
        ssl: { rejectUnauthorized: false }
      }
    },
    {
      name: 'Alternative connection format',
      config: {
        connectionString: 'postgresql://josiah:WPg5dfnvjCkM@ep-tidy-pine-a1cqk8l9.us-east-2.aws.neon.tech/neondb?sslmode=require',
        ssl: { rejectUnauthorized: false }
      }
    },
    {
      name: 'Default Neon credentials',
      config: {
        host: 'ep-tidy-pine-a1cqk8l9.us-east-2.aws.neon.tech',
        database: 'neondb',
        user: 'default',
        password: 'WPg5dfnvjCkM',
        port: 5432,
        ssl: { rejectUnauthorized: false }
      }
    }
  ];

  for (const { name, config } of configs) {
    console.log(`\nTesting connection: ${name}`);
    const pool = new Pool(config);
    
    try {
      const result = await pool.query('SELECT NOW()');
      console.log('SUCCESS! Current time:', result.rows[0].now);
      console.log('Connection details:', {
        host: config.host || 'From connection string',
        user: config.user || 'From connection string',
        database: config.database || 'From connection string'
      });
    } catch (error) {
      console.error('CONNECTION ERROR:', error.message);
      console.error('Error details:', {
        code: error.code,
        severity: error.severity,
        detail: error.detail,
        hint: error.hint
      });
    } finally {
      await pool.end();
    }
  }
}

testConnections()
  .then(() => console.log('All tests completed'))
  .catch(err => console.error('Test script error:', err))
  .finally(() => process.exit()); 