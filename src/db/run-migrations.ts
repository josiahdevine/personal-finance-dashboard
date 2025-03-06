import { sql } from './index';
import fs from 'fs';
import path from 'path';

async function runMigrations() {
  try {
    console.log('Starting database migrations...');

    // Read and execute the consolidated migration file
    const migrationPath = path.join(__dirname, 'migrations', '001_consolidated_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Execute the migration
    await sql(migrationSQL);

    console.log('Migrations completed successfully!');

    // Verify some key tables exist
    const tables = ['users', 'plaid_accounts', 'transactions', 'bills', 'subscriptions', 'investments', 'budget_categories', 'budget_entries', 'salary_entries', 'analytics_settings'];
    
    for (const table of tables) {
      const result = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = ${table}
        );
      `;
      console.log(`Table ${table} exists:`, result[0].exists);
    }

  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}

export default runMigrations; 