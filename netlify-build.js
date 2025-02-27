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

// Define build steps
const steps = [
  {
    name: 'Install dependencies',
    command: 'npm ci --include=dev',
    critical: true
  },
  {
    name: 'Create empty patch file if needed',
    command: () => {
      const patchFile = path.join(patchesDir, 'date-fns+2.29.3.patch');
      if (!fs.existsSync(patchFile)) {
        console.log('Creating empty patch file...');
        fs.writeFileSync(patchFile, '# Empty patch file for Netlify build\n');
      }
    },
    critical: false
  },
  {
    name: 'Install Netlify Functions dependencies',
    command: () => {
      const functionsDir = path.join(__dirname, 'functions');
      if (fs.existsSync(functionsDir)) {
        console.log('Installing Netlify Functions dependencies...');
        execSync('cd functions && npm ci', { stdio: 'inherit' });
      }
    },
    critical: true
  },
  {
    name: 'Build project',
    command: 'npm run build',
    critical: true
  }
];

// Execute each step
console.log('Starting Netlify build process...');
let success = true;

steps.forEach(step => {
  try {
    console.log(`\n[${step.name}]`);
    if (typeof step.command === 'function') {
      step.command();
    } else {
      execSync(step.command, { stdio: 'inherit' });
    }
    console.log(`✅ ${step.name} completed successfully.`);
  } catch (error) {
    console.error(`❌ ${step.name} failed: ${error.message}`);
    if (step.critical) {
      success = false;
      process.exit(1);
    }
  }
});

if (success) {
  console.log('\n🎉 Build completed successfully!');
  process.exit(0);
} 