# Simple script to start frontend and backend
Write-Host "Starting development servers..." -ForegroundColor Cyan

# Start Netlify Functions server in a separate window
Write-Host "Starting Netlify Functions server on port 8889..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-Command", "netlify dev --port 8889"

# Wait a moment for the backend to start
Write-Host "Waiting for backend to initialize (5 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start the frontend React app
Write-Host "Starting React app on port 3000..." -ForegroundColor Cyan
npm start 