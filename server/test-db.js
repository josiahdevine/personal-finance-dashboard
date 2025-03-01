// test-db.js
require('dotenv').config({ path: '.env.test' });
const { Client } = require('pg');
const colors = require('colors/safe');

async function testConnection(config, label) {
    console.log(colors.cyan(`\nTesting connection: ${label}`));
    
    const client = new Client(config);
    
    try {
        await client.connect();
        const result = await client.query('SELECT NOW()');
        console.log(colors.green('SUCCESS!'), 'Current time:', result.rows[0].now);
        console.log('Connection details:', {
            host: client.connectionParameters.host,
            user: client.connectionParameters.user,
            database: client.connectionParameters.database
        });
        await client.end();
    } catch (error) {
        console.log(colors.red('CONNECTION ERROR:'), error.message);
        console.log('Error details:', {
            code: error.code,
            severity: error.severity,
            detail: error.detail,
            hint: error.hint
        });
        try {
            await client.end();
        } catch (e) {
            // Ignore cleanup errors
        }
    }
}

async function main() {
    // Log environment variables (safely)
    console.log('Database URL from env:', process.env.DATABASE_URL ? 'Present (not shown for security)' : 'Missing');
    console.log('NODE_ENV:', process.env.NODE_ENV);

    // Test connection using environment variables
    await testConnection({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: true
        }
    }, 'From .env file');

    // Test with original connection string
    await testConnection({
        user: 'neondb_owner',
        password: process.env.PGPASSWORD,
        host: process.env.PGHOST,
        port: process.env.PGPORT,
        database: process.env.PGDATABASE,
        ssl: {
            rejectUnauthorized: true
        }
    }, 'Original connection string');

    // Test with alternative connection format
    await testConnection({
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        host: process.env.PGHOST,
        port: process.env.PGPORT,
        database: process.env.PGDATABASE,
        ssl: {
            rejectUnauthorized: true
        }
    }, 'Alternative connection format');

    // Test with default Neon credentials
    await testConnection({
        user: 'default',
        password: process.env.PGPASSWORD,
        host: process.env.PGHOST,
        port: process.env.PGPORT,
        database: process.env.PGDATABASE,
        ssl: {
            rejectUnauthorized: true
        }
    }, 'Default Neon credentials');

    console.log('\nAll tests completed');
}

main().catch(error => {
    console.error(colors.red('\nUnexpected error:'), error);
    process.exit(1);
}); 