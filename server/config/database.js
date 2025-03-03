const dotenv = require('dotenv');
dotenv.config();

// Get database configuration from environment variables
const databaseConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? 
    { rejectUnauthorized: false } : 
    false
};

// Log database configuration (excluding sensitive data)
console.log('Database Configuration:', {
  environment: process.env.NODE_ENV || 'development',
  ssl: !!databaseConfig.ssl,
  connectionString: databaseConfig.connectionString ? 'Set' : 'Not set'
});

module.exports = databaseConfig; 