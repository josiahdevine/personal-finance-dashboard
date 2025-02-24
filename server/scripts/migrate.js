const { spawn } = require('child_process');
const path = require('path');

// Get the environment from command line argument or default to development
const env = process.env.NODE_ENV || 'development';
const configFile = path.join(__dirname, '..', 'database.json');

// Construct the migrate command
const command = 'node-pg-migrate';
const args = [
    'up',
    '--config', configFile,
    '--envPath', path.join(__dirname, '..', '.env'),
    '--migrations-dir', path.join(__dirname, '..', 'db', 'migrations'),
    '--migration-file-language', 'sql',
    '--verbose'
];

if (env === 'production') {
    args.push('--no-check-order');
}

// Execute the migration
const migrate = spawn(command, args, {
    stdio: 'inherit',
    shell: true
});

migrate.on('error', (err) => {
    console.error('Failed to start migration:', err);
    process.exit(1);
});

migrate.on('exit', (code) => {
    if (code !== 0) {
        console.error(`Migration process exited with code ${code}`);
        process.exit(code);
    }
    console.log('Migration completed successfully');
}); 