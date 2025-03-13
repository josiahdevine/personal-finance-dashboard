@echo off
echo Starting comprehensive Docker build fix...

:: Create necessary directories in Docker container
echo Creating necessary directories...
docker exec -it finance-dashboard-dev mkdir -p /app/src/lower-components

:: Copy TypeScript declaration files
echo Copying TypeScript declarations...
docker cp missing-modules.d.ts finance-dashboard-dev:/app/src/

:: Copy the Babel configuration
echo Copying Babel configuration...
docker cp babel.config.js finance-dashboard-dev:/app/

:: Copy the CRACO configuration
echo Copying CRACO configuration...
docker cp craco.config.cjs finance-dashboard-dev:/app/

:: Copy the package.json with updated scripts
echo Copying package.json...
docker cp package.json finance-dashboard-dev:/app/

:: Copy the fixed PlaidLink component
echo Copying fixed PlaidLink component...
docker cp PlaidLink.fixed-token.tsx finance-dashboard-dev:/app/src/components/features/plaid/PlaidLink.tsx

:: Copy the plaidService bridge file
echo Copying plaidService bridge...
docker cp plaidService.bridge.js finance-dashboard-dev:/app/src/lower-components/plaidService.js

:: Copy the fixed AccountSettings component
echo Copying fixed AccountSettings component...
docker cp AccountSettings.fixed.tsx finance-dashboard-dev:/app/src/components/features/settings/AccountSettings.tsx

:: Install any missing dependencies
echo Installing dependencies...
docker exec -it finance-dashboard-dev npm install --save react-plaid-link @types/react-plaid-link

:: Run the build process in the Docker container
echo Running build process in Docker container...
docker exec -it finance-dashboard-dev npm run build

:: Display any errors
if %ERRORLEVEL% NEQ 0 (
  echo Build failed. Check the error messages above.
) else (
  echo Build completed successfully. Your app is ready for deployment.
) 