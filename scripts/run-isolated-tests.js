#!/usr/bin/env node

/**
 * Script to run isolated component tests
 * This script runs Jest with the isolated configuration
 */

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get command line arguments
const args = process.argv.slice(2);

// Check if a specific test file was provided
const testFile = args.find(arg => arg.endsWith('.test.tsx') || arg.endsWith('.test.js'));

// Build the Jest command
let command = 'npx jest';

// Add the config file
command += ' --config=jest.isolated.config.js';

// Add the test file if provided
if (testFile) {
  command += ` ${testFile}`;
}

// Add additional flags
command += ' --no-cache'; // Disable cache to ensure fresh runs
command += ' --verbose'; // Show detailed output

console.log(`Running command: ${command}`);

try {
  // Run the command
  execSync(command, { stdio: 'inherit' });
  console.log('Tests completed successfully!');
  process.exit(0);
} catch (error) {
  console.error('Tests failed with error:', error.message);
  process.exit(1);
} 