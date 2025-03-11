/**
 * Central Migration Runner
 * 
 * This script orchestrates all migrations for the finance dashboard application.
 * It can be used to run specific migrations or all pending migrations.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SQL_DIR = path.join(__dirname, '../sql');
const RUNNERS = {
  neon: path.join(__dirname, 'run-neon-migration.js'),
  plaid: path.join(__dirname, 'run-plaid-migration.js')
};

/**
 * Get all SQL migration files 
 */
function getMigrationFiles() {
  return fs.readdirSync(SQL_DIR)
    .filter(file => file.endsWith('.sql'))
    .map(file => path.join(SQL_DIR, file));
}

/**
 * Run a specific migration using the appropriate runner
 */
function runMigration(migrationPath, type = 'neon') {
  console.log(`Running migration: ${path.basename(migrationPath)}`);
  
  try {
    if (type === 'plaid') {
      execSync(`node ${RUNNERS.plaid} ${migrationPath}`, { stdio: 'inherit' });
    } else {
      execSync(`node ${RUNNERS.neon} ${migrationPath}`, { stdio: 'inherit' });
    }
    console.log(`Successfully completed migration: ${path.basename(migrationPath)}`);
    return true;
  } catch (error) {
    console.error(`Failed to run migration ${path.basename(migrationPath)}: ${error.message}`);
    return false;
  }
}

/**
 * Run all migrations in sequence
 */
function runAllMigrations() {
  const migrations = getMigrationFiles();
  console.log(`Found ${migrations.length} migrations to process.`);
  
  let successCount = 0;
  
  for (const migration of migrations) {
    const filename = path.basename(migration);
    const type = filename.includes('plaid') ? 'plaid' : 'neon';
    
    if (runMigration(migration, type)) {
      successCount++;
    }
  }
  
  console.log(`Completed ${successCount} of ${migrations.length} migrations.`);
}

// Command line parsing
const args = process.argv.slice(2);
if (args.length === 0) {
  runAllMigrations();
} else if (args[0] === '--help') {
  console.log(`
    Migration Runner
    
    Usage:
      node run-all-migrations.js                    Run all migrations
      node run-all-migrations.js <migration-file>   Run a specific migration
      node run-all-migrations.js --type=<type>      Run all migrations of a specific type (neon or plaid)
  `);
} else if (args[0].startsWith('--type=')) {
  const type = args[0].split('=')[1];
  if (type !== 'neon' && type !== 'plaid') {
    console.error('Invalid type. Must be either "neon" or "plaid".');
    process.exit(1);
  }
  
  const migrations = getMigrationFiles().filter(m => 
    type === 'plaid' ? path.basename(m).includes('plaid') : !path.basename(m).includes('plaid')
  );
  
  for (const migration of migrations) {
    runMigration(migration, type);
  }
} else {
  // Assume it's a specific migration file
  const migration = args[0].endsWith('.sql') ? args[0] : `${args[0]}.sql`;
  const migrationPath = path.resolve(SQL_DIR, migration);
  
  if (!fs.existsSync(migrationPath)) {
    console.error(`Migration file not found: ${migration}`);
    process.exit(1);
  }
  
  const type = path.basename(migrationPath).includes('plaid') ? 'plaid' : 'neon';
  runMigration(migrationPath, type);
}
