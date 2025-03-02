#!/usr/bin/env node

/**
 * Special build script for Netlify deployment
 * This script handles the build process while safely managing the patch-package issue
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// Check if we're running in a Linux/Unix environment and ensure script is executable
if (process.platform !== 'win32') {
  try {
    console.log('Setting executable permissions on build script...');
    execSync('chmod +x ' + __filename);
  } catch (error) {
    console.log('Note: Unable to set executable permissions, but continuing build process');
  }
}

// Create patches directory if it doesn't exist
const patchesDir = join(__dirname, 'patches');
if (!existsSync(patchesDir)) {
  console.log('Creating patches directory...');
  mkdirSync(patchesDir, { recursive: true });
}

console.log('Starting Netlify build process...');

// Ensure all dependencies are installed
console.log('Installing dependencies...');
execSync('npm install', { stdio: 'inherit' });

// Run the production build
console.log('Building production bundle...');
execSync('npm run build:prod', { stdio: 'inherit' });

// Create Netlify functions directory if it doesn't exist
if (!existsSync('./functions')) {
  console.log('Creating functions directory...');
  mkdirSync('./functions');
}

console.log('Build process completed successfully!'); 