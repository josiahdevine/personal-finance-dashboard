/**
 * Cross-platform Netlify deployment script
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Log with timestamp
const log = (message) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
};

// Run a command and log output
const run = (command) => {
  log(`Running: ${command}`);
  try {
    const output = execSync(command, { stdio: 'inherit' });
    return output;
  } catch (error) {
    log(`Error executing command: ${error.message}`);
    process.exit(1);
  }
};

// Main deployment function
const deploy = async () => {
  log('Starting deployment process');
  
  // Set environment variables
  process.env.NODE_ENV = 'production';
  process.env.DISABLE_ESLINT_PLUGIN = 'true';
  process.env.GENERATE_SOURCEMAP = 'false';
  
  // Clean previous build
  log('Cleaning previous build');
  if (fs.existsSync(path.join(__dirname, 'build'))) {
    fs.rmSync(path.join(__dirname, 'build'), { recursive: true, force: true });
  }
  
  // Install dependencies
  log('Installing dependencies');
  run('npm ci');
  
  // Build the app
  log('Building the application');
  run('npm run build');
  
  log('Build completed successfully');
};

// Run the deployment
deploy().catch(error => {
  log(`Deployment failed: ${error.message}`);
  process.exit(1);
}); 