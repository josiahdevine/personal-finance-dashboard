const fs = require('fs').promises;
const path = require('path');
const { pool } = require('../db');
const { log, logError } = require('../utils/logger');

async function runMigrations() {
    const client = await pool.connect();
    try {
        // Create migrations table if it doesn't exist
        await client.query(`
            CREATE TABLE IF NOT EXISTS migrations (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Get list of migration files
        const migrationsDir = path.join(__dirname, '../db/migrations');
        const files = await fs.readdir(migrationsDir);
        const migrationFiles = files.filter(f => f.endsWith('.sql')).sort();

        // Get executed migrations
        const { rows: executedMigrations } = await client.query(
            'SELECT name FROM migrations'
        );
        const executedMigrationNames = executedMigrations.map(m => m.name);

        // Run pending migrations
        for (const file of migrationFiles) {
            if (!executedMigrationNames.includes(file)) {
                log(`Running migration: ${file}`);
                const filePath = path.join(migrationsDir, file);
                const sql = await fs.readFile(filePath, 'utf-8');

                await client.query('BEGIN');
                try {
                    await client.query(sql);
                    await client.query(
                        'INSERT INTO migrations (name) VALUES ($1)',
                        [file]
                    );
                    await client.query('COMMIT');
                    log(`Successfully executed migration: ${file}`);
                } catch (error) {
                    await client.query('ROLLBACK');
                    throw error;
                }
            }
        }

        log('All migrations completed successfully');
    } catch (error) {
        logError('Migration failed:', error);
        process.exit(1);
    } finally {
        client.release();
    }
}

runMigrations().then(() => {
    log('Migration process completed');
    process.exit(0);
}).catch(error => {
    logError('Migration process failed:', error);
    process.exit(1);
}); 