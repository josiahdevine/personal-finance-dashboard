import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { pool } from './config';

// Load environment variables
dotenv.config();

async function runMigrations() {
  try {
    // Enable UUID extension if not already enabled
    try {
      await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
      console.log('UUID extension enabled');
    } catch (error) {
      console.error('Error enabling UUID extension:', error);
      throw error;
    }

    // Create migrations table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Get all migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .filter(file => !file.startsWith('001_')) // Skip the first migration
      .sort();

    // Get executed migrations
    const { rows: executedMigrations } = await pool.query(
      'SELECT name FROM migrations'
    );
    const executedFiles = new Set(executedMigrations.map(row => row.name));

    // Run pending migrations
    for (const file of files) {
      if (!executedFiles.has(file)) {
        console.log(`Running migration: ${file}`);
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        
        await pool.query('BEGIN');
        try {
          // Execute the entire SQL file as one statement
          await pool.query(sql);
          
          await pool.query(
            'INSERT INTO migrations (name) VALUES ($1)',
            [file]
          );
          await pool.query('COMMIT');
          console.log(`Migration ${file} completed successfully`);
        } catch (error) {
          await pool.query('ROLLBACK');
          console.error(`Error running migration ${file}:`, error);
          throw error;
        }
      } else {
        console.log(`Migration ${file} already executed, skipping...`);
      }
    }

    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migrations
runMigrations(); 