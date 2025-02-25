#!/bin/bash

# Custom build script for Vercel deployment

# Echo commands for debugging
set -x

# Set environment variables
export CI=false
export NODE_ENV=production
export GENERATE_SOURCEMAP=false

# Install dependencies
echo "Installing dependencies..."
npm ci --prefer-offline --no-audit

# Build the application
echo "Building application..."
npm run build:prod || npm run build

# Report build status
if [ $? -eq 0 ]; then
  echo "Build successful!"
  exit 0
else
  echo "Build failed!"
  exit 1
fi 