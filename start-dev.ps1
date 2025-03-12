# Kill any processes using the required ports
Write-Host "`n==============================================" -ForegroundColor Cyan
Write-Host "Personal Finance Dashboard Development Setup" -ForegroundColor Cyan
Write-Host "==============================================`n" -ForegroundColor Cyan

Write-Host "🔍 Checking for processes using ports 3000, 8889, and 3041..." -ForegroundColor Yellow

$port3000 = (Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue).OwningProcess
if ($port3000) {
    Write-Host "  ⚠️  Killing process using port 3000 (PID: $port3000)" -ForegroundColor Yellow
    Stop-Process -Id $port3000 -Force -ErrorAction SilentlyContinue
} else {
    Write-Host "  ✅ Port 3000 is available" -ForegroundColor Green
}

$port8889 = (Get-NetTCPConnection -LocalPort 8889 -ErrorAction SilentlyContinue).OwningProcess
if ($port8889) {
    Write-Host "  ⚠️  Killing process using port 8889 (PID: $port8889)" -ForegroundColor Yellow
    Stop-Process -Id $port8889 -Force -ErrorAction SilentlyContinue
} else {
    Write-Host "  ✅ Port 8889 is available" -ForegroundColor Green
}

$port3041 = (Get-NetTCPConnection -LocalPort 3041 -ErrorAction SilentlyContinue).OwningProcess
if ($port3041) {
    Write-Host "  ⚠️  Killing process using port 3041 (PID: $port3041)" -ForegroundColor Yellow
    Stop-Process -Id $port3041 -Force -ErrorAction SilentlyContinue
} else {
    Write-Host "  ✅ Port 3041 is available" -ForegroundColor Green
}

# Remove any mock API files if they exist
$mockFiles = @(
    "functions/simple-health-check.js",
    "functions/auth-login-simple.js"
)

foreach ($file in $mockFiles) {
    if (Test-Path $file) {
        Write-Host "  🗑️  Removing mock file: $file" -ForegroundColor Yellow
        Remove-Item $file -Force
    }
}

# Fix the PowerShell command by properly escaping quotes
Write-Host "`n🚀 Starting Netlify Functions server on port 8889..." -ForegroundColor Cyan
$currentDir = $pwd.Path.Replace("\", "\\")
$netlifyCommand = "cd `"$currentDir`"; netlify dev --port 8889"
Start-Process powershell -ArgumentList "-Command", $netlifyCommand

# Give the backend a moment to start
Write-Host "⏳ Waiting for backend to initialize (5 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start the frontend React app in current window
Write-Host "`n🚀 Starting React app on port 3000..." -ForegroundColor Cyan
Write-Host "`n📋 HELPFUL TIPS:" -ForegroundColor Cyan
Write-Host "  • Check your API requests in the Network tab to ensure connectivity" -ForegroundColor White
Write-Host "  • Verify environment variables in .env.development are correctly set" -ForegroundColor White
Write-Host "  • Ensure your database is running and accessible" -ForegroundColor White
Write-Host "  • Watch the console logs for CORS messages and API debugging info`n" -ForegroundColor White

npm start

Write-Host "Development servers started successfully" 