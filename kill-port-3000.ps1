$port = 3000
$processId = (Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue).OwningProcess
if ($processId) {
    Write-Host "Killing process using port $port"
    Stop-Process -Id $processId -Force
} else {
    Write-Host "No process found using port $port"
} 