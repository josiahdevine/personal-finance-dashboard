@echo off
echo Starting minimal Docker build with simplified components...

:: Set up necessary directories
echo Setting up directories...
docker exec -it finance-dashboard-dev mkdir -p /app/src/lower-components
docker exec -it finance-dashboard-dev mkdir -p /app/src/components/features/plaid

:: Copy the plaidService bridge file
echo Copying plaidService bridge...
docker cp plaidService.bridge.js finance-dashboard-dev:/app/src/lower-components/plaidService.js

:: Copy the simplified PlaidLink component
echo Copying minimal PlaidLink component...
docker cp src/components/features/plaid/PlaidLink.tsx finance-dashboard-dev:/app/src/components/features/plaid/PlaidLink.tsx

:: Copy TypeScript declaration files
echo Copying TypeScript declarations...
docker cp missing-modules.d.ts finance-dashboard-dev:/app/src/

:: Copy the Babel configuration
echo Copying Babel configuration...
docker cp babel.config.js finance-dashboard-dev:/app/

:: Copy the CRACO configuration
echo Copying CRACO configuration...
docker cp craco.config.cjs finance-dashboard-dev:/app/

:: Run the build process in the Docker container
echo Running build process in Docker container...
docker exec -it finance-dashboard-dev npm run build

:: Display any errors
if %ERRORLEVEL% NEQ 0 (
  echo Build failed. Check the error messages above.
) else (
  echo Build completed successfully. Your app is ready for deployment.
) 