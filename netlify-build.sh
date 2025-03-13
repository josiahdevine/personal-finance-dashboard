#!/bin/bash

# Print Node.js and npm versions
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# Install dependencies
echo "Installing dependencies..."
npm ci

# Set environment variables for the build
export GENERATE_SOURCEMAP=false
export DISABLE_ESLINT_PLUGIN=true
export NODE_ENV=production

# Build the application
echo "Building the application..."
npm run build

echo "Build completed successfully!" 