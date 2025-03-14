#!/usr/bin/env node

/**
 * Docker-based Netlify deployment script
 * This script handles building the application in a Docker container
 * and then deploying it to Netlify
 */

const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

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
  log('Starting Docker-based Netlify deployment process');
  
  // Ensure build directory exists
  const buildDir = path.join(process.cwd(), 'build');
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
  }
  
  // Build the Docker image (build stage only)
  log('Building Docker image for production');
  run('docker build --target build -t finance-dashboard-build -f Dockerfile.prod .');
  
  // Create a temporary container to extract build files
  log('Creating temporary container to extract build files');
  run('docker create --name temp-build-container finance-dashboard-build');
  
  // Copy build files from container to local filesystem
  log('Copying build files from container to local filesystem');
  run('docker cp temp-build-container:/app/build/. ./build/');
  
  // Cleanup temporary container
  log('Cleaning up temporary container');
  run('docker rm temp-build-container');
  
  // Deploy to Netlify using the local build folder
  log('Deploying to Netlify');
  run('netlify deploy --prod');
  
  log('Deployment completed successfully');
};

// Run the deployment
deploy().catch(error => {
  log(`Deployment failed: ${error.message}`);
  process.exit(1);
}); 