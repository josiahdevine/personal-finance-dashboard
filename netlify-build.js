#!/usr/bin/env node

/**
 * Special build script for Netlify deployment
 * This script handles the build setup while safely managing the patch-package issue
 * and addressing the Babel runtime import issue
 */

const { execSync } = require('child_process');
const { existsSync, mkdirSync, symlinkSync } = require('fs');
const { join } = require('path');

// Check if we're running in a Linux/Unix environment and ensure script is executable
if (process.platform !== 'win32') {
  try {
    console.log('🔧 Setting executable permissions on build script...');
    execSync('chmod +x ' + __filename);
  } catch (error) {
    console.log('⚠️ Note: Unable to set executable permissions, but continuing build process');
  }
}

// Create patches directory if it doesn't exist
const patchesDir = join(__dirname, 'patches');
if (!existsSync(patchesDir)) {
  console.log('📁 Creating patches directory...');
  mkdirSync(patchesDir, { recursive: true });
}

console.log('🚀 Starting Netlify pre-build setup...');

// Fix for Babel runtime import issue
console.log('🔗 Creating symlink for @babel/runtime in src directory...');
const srcBabelRuntimeDir = join(__dirname, 'src', '@babel');
const nodeBabelRuntimeDir = join(__dirname, 'node_modules', '@babel', 'runtime');

if (!existsSync(srcBabelRuntimeDir)) {
  mkdirSync(srcBabelRuntimeDir, { recursive: true });
}

try {
  symlinkSync(nodeBabelRuntimeDir, join(srcBabelRuntimeDir, 'runtime'), 'dir');
  console.log('✅ Successfully created symlink for @babel/runtime');
} catch (error) {
  console.error('❌ Failed to create symlink:', error.message);
  console.log('🔄 Will attempt to continue build process...');
}

// Create Netlify functions directory if it doesn't exist
if (!existsSync('./functions')) {
  console.log('📁 Creating functions directory...');
  mkdirSync('./functions');
}

console.log('🎉 Pre-build setup completed. Build process will continue...'); 