const fs = require('fs');
const path = require('path');

function createMigration() {
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
  const name = process.argv[2] || 'migration';
  const filename = `${timestamp}_${name}.sql`;
  const migrationsDir = path.join(__dirname, '..', 'src', 'db', 'migrations');

  // Create migrations directory if it doesn't exist
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
  }

  const filePath = path.join(migrationsDir, filename);
  fs.writeFileSync(filePath, '-- Migration: ' + name + '\n\n');

  console.log(`Created migration file: ${filename}`);
}

createMigration(); 