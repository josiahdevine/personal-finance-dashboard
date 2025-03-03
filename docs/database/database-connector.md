# Database Connector Documentation

## Overview
The Database Connector module provides standardized database connection handling for the Personal Finance Dashboard application using Neon Tech PostgreSQL. It implements connection pooling, query optimization, and robust error handling.

## Features
- Connection pooling with automatic retry mechanism
- Query optimization and monitoring
- Table schema verification and management
- Database health monitoring and metrics
- Error handling and logging

## API Reference

### `getDbPool()`
Creates or returns an existing database connection pool.

**Returns:** PostgreSQL Pool instance

**Configuration:**
```javascript
{
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: { rejectUnauthorized: false } // in production
}
```

### `query(text, params = [], maxRetries = 3)`
Executes a database query with automatic retries.

**Parameters:**
- `text` (string): SQL query text
- `params` (Array): Query parameters
- `maxRetries` (number): Maximum retry attempts

**Returns:** Promise<object> with query results

### `createTableIfNotExists(tableName, columns)`
Creates a new table if it doesn't already exist.

**Parameters:**
- `tableName` (string): Name of the table to create
- `columns` (object): Column definitions

### `checkDbStatus()`
Verifies database connectivity and returns system status.

**Returns:**
```javascript
{
  connected: boolean,
  currentTime: Date,
  tables: string[]
}
```

### `verifyTableSchema(tableName, requiredColumns)`
Verifies and updates table schema as needed.

**Parameters:**
- `tableName` (string): Table to verify
- `requiredColumns` (object): Required column definitions

### `getDbMetrics()`
Retrieves database performance metrics and statistics.

**Returns:**
```javascript
{
  status: object,
  metrics: object,
  optimization: object,
  poolStats: object,
  timestamp: string
}
```

### `setQueryOptimization(enable)`
Enables or disables query optimization.

**Parameters:**
- `enable` (boolean): Whether to enable optimization

### `closePool()`
Closes the database connection pool.

## Error Handling
The module implements comprehensive error handling:
- Connection errors trigger automatic pool reset
- Query errors include detailed logging
- Exponential backoff for retries
- Automatic reconnection for specific error codes

## Best Practices
1. Always use parameterized queries to prevent SQL injection
2. Release clients back to the pool after use
3. Handle connection errors appropriately
4. Monitor query performance using the built-in metrics
5. Use transaction blocks for multi-query operations

## Environment Variables
Required environment variables:
- `DATABASE_URL`: Neon Tech PostgreSQL connection string
- `NODE_ENV`: Environment setting ('production' or 'development')
- `ENABLE_QUERY_OPTIMIZATION`: Enable/disable query optimization

## Example Usage
```javascript
import dbConnector from './db-connector.js';

// Basic query
const result = await dbConnector.query('SELECT * FROM users WHERE id = $1', [userId]);

// Create table
await dbConnector.createTableIfNotExists('users', {
  id: 'SERIAL PRIMARY KEY',
  name: 'VARCHAR(255)',
  email: 'VARCHAR(255) UNIQUE'
});

// Check database status
const status = await dbConnector.checkDbStatus();
``` 