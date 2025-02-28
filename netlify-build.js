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
function runCommand(command, step) {
  try {
    console.log(`[${step}]`);
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${step} completed successfully.`);
    return true;
  } catch (error) {
    console.error(`❌ Error during ${step}:`);
    console.error(error.message);
    return false;
  }
}

// Main build steps
const steps = [
  {
    name: 'Install dependencies',
    command: 'npm ci'
  },
  {
    name: 'Create empty patch file if needed',
    command: 'touch patches/.gitkeep'
  },
  {
    name: 'Install global build dependencies',
    command: 'npm install -g cross-env @craco/craco'
  },
  {
    name: 'Install Netlify Functions dependencies',
    command: 'cd functions && npm install && cd ..'
  },
  {
    name: 'Build project',
    command: 'cross-env CI=false GENERATE_SOURCEMAP=false craco build'
  }
];

// Execute build steps
let success = true;
for (const step of steps) {
  success = runCommand(step.command, step.name);
  if (!success) {
    process.exit(1);
  }
}

console.log('🎉 Build completed successfully!'); 