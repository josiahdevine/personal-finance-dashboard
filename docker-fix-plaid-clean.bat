@echo off
echo Starting clean PlaidLink fix...

:: Copy the plaidService bridge file first
echo Copying plaidService bridge...
docker cp plaidService.bridge.js finance-dashboard-dev:/app/src/lower-components/plaidService.js

:: Copy the consolidated PlaidLink component
echo Copying consolidated PlaidLink component...
docker cp src/components/features/plaid/PlaidLink.tsx finance-dashboard-dev:/app/src/components/features/plaid/PlaidLink.tsx

:: Run the build process in the Docker container
echo Running build process in Docker container...
docker exec -it finance-dashboard-dev npm run build

:: Display any errors
if %ERRORLEVEL% NEQ 0 (
  echo Build failed. Check the error messages above.
) else (
  echo Build completed successfully. Your app is ready for deployment.
  
  :: Clean up temporary files if build was successful
  echo Cleaning up temporary files...
  del PlaidLink.fixed.tsx 2>nul
  del PlaidLink.complete.tsx 2>nul
  del PlaidLink.simple.tsx 2>nul
  del PlaidLink.fixed-token.tsx 2>nul
  echo Cleanup completed.
) 