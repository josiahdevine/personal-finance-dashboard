@echo off
echo Copying fixed PlaidLink component to Docker container...

:: Copy the fixed PlaidLink component
docker cp PlaidLink.complete.tsx finance-dashboard-dev:/app/src/components/features/plaid/PlaidLink.tsx

:: Copy the plaidService bridge file
docker cp plaidService.bridge.js finance-dashboard-dev:/app/src/lower-components/plaidService.js

:: Run the build process in the Docker container
echo Running build process in Docker container...
docker exec -it finance-dashboard-dev npm run build

:: Display any errors
if %ERRORLEVEL% NEQ 0 (
  echo Build failed. Check the error messages above.
) else (
  echo Build completed successfully. Your app is ready for deployment.
) 