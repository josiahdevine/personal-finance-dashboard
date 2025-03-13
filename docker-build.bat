@echo off
echo Running build process in Docker container...
docker exec -it finance-dashboard-dev npm run build

if %ERRORLEVEL% neq 0 (
  echo Build failed. Check the error messages above.
) else (
  echo Build completed successfully. Your app is ready for deployment.
) 