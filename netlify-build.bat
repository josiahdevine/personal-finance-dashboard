@echo off
echo Running Netlify build script for Windows

echo Node version: 
node -v
echo NPM version: 
npm -v

echo Installing dependencies...
npm ci

echo Building the application...
set GENERATE_SOURCEMAP=false
set DISABLE_ESLINT_PLUGIN=true
set NODE_ENV=production
npm run build

echo Build completed successfully! 