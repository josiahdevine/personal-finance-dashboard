@echo off
echo Copying fixed files to Docker container...

:: Copy TypeScript declaration files
docker cp missing-modules.d.ts finance-dashboard-dev:/app/src/

:: Copy the Babel configuration
docker cp babel.config.js finance-dashboard-dev:/app/

:: Copy the CRACO configuration
docker cp craco.config.cjs finance-dashboard-dev:/app/

:: Copy the package.json with updated scripts
docker cp package.json finance-dashboard-dev:/app/

:: Run the build process in the Docker container
echo Running build process in Docker container...
docker exec -it finance-dashboard-dev npm run build

:: Display any errors
if %ERRORLEVEL% NEQ 0 (
  echo Build failed. Check the error messages above.
) else (
  echo Build completed successfully. Your app is ready for deployment.
) 