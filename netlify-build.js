#!/usr/bin/env node

/**
 * Special build script for Netlify deployment
 * This script handles the build process while safely managing the patch-package issue
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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
const patchesDir = path.join(__dirname, 'patches');
if (!fs.existsSync(patchesDir)) {
  console.log('Creating patches directory...');
  fs.mkdirSync(patchesDir, { recursive: true });
}

console.log('Starting Netlify build process...');

// Function to execute commands and handle errors
function runCommand(command, errorMessage) {
    try {
        execSync(command, { stdio: 'inherit' });
    } catch (error) {
        console.error(`Error: ${errorMessage}`);
        console.error(error);
        process.exit(1);
    }
}

console.log('[Install dependencies]');
runCommand('npm ci', 'Failed to install dependencies');

// Create empty patch file if it doesn't exist
console.log('[Create empty patch file if needed]');
const patchDir = './patches';
if (!fs.existsSync(patchDir)) {
    fs.mkdirSync(patchDir);
}

// Install Netlify Functions dependencies
console.log('[Install Netlify Functions dependencies]');
if (fs.existsSync('./functions')) {
    console.log('Installing Netlify Functions dependencies...');
    runCommand('cd functions && npm install', 'Failed to install function dependencies');
}

// Build the project
console.log('[Build project]');
process.env.CI = 'false';
process.env.GENERATE_SOURCEMAP = 'false';
runCommand('npm run build', 'Failed to build project');

console.log('🎉 Build completed successfully!'); 