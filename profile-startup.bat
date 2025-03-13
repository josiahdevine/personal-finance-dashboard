@echo off
echo ==========================================
echo Personal Finance Dashboard - Startup Profiler
echo ==========================================
echo.
echo This script will profile the startup time of the development server
echo and provide recommendations to improve performance.
echo.
echo Press Ctrl+C at any time to cancel.
echo.
echo Starting profiling...
echo.

node scripts/profile-startup.js

echo.
echo Profiling complete. Results saved to startup-profile-results.json
echo.
echo Recommendations:
echo 1. Check for duplicate packages
echo 2. Use code splitting for large components
echo 3. Consider lazy loading less frequently used components
echo 4. Review large dependencies that might be slowing down startup
echo.
echo See startup-profile-results.json for detailed information.
echo.

pause 