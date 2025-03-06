param(
    [switch]$DryRun = $false
)

# Function to simulate or execute an action
function Invoke-Action {
    param(
        [string]$Description,
        [scriptblock]$Action
    )
    
    if ($DryRun) {
        Write-Host "[DRY RUN] Would: $Description" -ForegroundColor Cyan
    } else {
        & $Action
    }
}

Write-Host "Starting dependency cleanup process..." -ForegroundColor Green
if ($DryRun) {
    Write-Host "*** DRY RUN MODE - No changes will be made ***" -ForegroundColor Cyan
}

# Function to check if we're in the correct directory
function Test-ProjectDirectory {
    if (-not (Test-Path package.json)) {
        Write-Host "ERROR: package.json not found in current directory!" -ForegroundColor Red
        Write-Host "Please make sure you're running this script from the project root directory." -ForegroundColor Red
        return $false
    }
    return $true
}

# Function to safely remove directory
function Remove-DirectorySafely {
    param([string]$path)
    
    if (Test-Path $path) {
        try {
            Write-Host "Removing $path..." -ForegroundColor Yellow
            # First try using Remove-Item
            Remove-Item -Path $path -Recurse -Force -ErrorAction Stop
        }
        catch {
            Write-Host "Warning: Using alternative removal method..." -ForegroundColor Yellow
            # If Remove-Item fails, try using cmd.exe's rd command
            $result = cmd /c "rd /s /q `"$path`"" 2>&1
            if ($LASTEXITCODE -ne 0) {
                Write-Host "Warning: Could not fully remove $path. Continuing..." -ForegroundColor Yellow
            }
        }
    }
}

# Verify we're in the correct directory
if (-not (Test-ProjectDirectory)) {
    exit 1
}

# Create a timestamp for backup
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$tempDir = "temp_modules_$timestamp"

# Stop any running npm processes
Invoke-Action -Description "Stop all node and npm processes" -Action {
    Write-Host "Stopping any running npm processes..." -ForegroundColor Yellow
    $processesToKill = @("node", "npm")
    foreach ($proc in $processesToKill) {
        Get-Process -Name $proc -ErrorAction SilentlyContinue | Stop-Process -Force
    }
    # Give processes time to shut down
    Start-Sleep -Seconds 2
}

# Remove node_modules and lock files
Invoke-Action -Description "Remove node_modules directory" -Action {
    Write-Host "Removing node_modules and lock files..." -ForegroundColor Yellow
    Remove-DirectorySafely "node_modules"
}

Invoke-Action -Description "Remove package-lock.json" -Action {
    if (Test-Path package-lock.json) {
        Remove-Item package-lock.json -Force -ErrorAction SilentlyContinue
    }
}

# Clear npm cache
Invoke-Action -Description "Clear npm cache" -Action {
    Write-Host "Clearing npm cache..." -ForegroundColor Yellow
    npm cache clean --force
}

# Create temporary directory for fresh installation
Invoke-Action -Description "Create temporary directory: $tempDir" -Action {
    Write-Host "Creating temporary directory for installation..." -ForegroundColor Yellow
    if (Test-Path $tempDir) {
        Remove-DirectorySafely $tempDir
    }
    New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
}

# Backup current package.json
Invoke-Action -Description "Backup package.json to temporary directory" -Action {
    Write-Host "Backing up package.json..." -ForegroundColor Yellow
    try {
        Copy-Item -Path "package.json" -Destination "$tempDir\package.json" -Force -ErrorAction Stop
    }
    catch {
        Write-Host "ERROR: Failed to copy package.json!" -ForegroundColor Red
        Write-Host $_.Exception.Message
        exit 1
    }
}

# Install dependencies in temporary directory
$currentLocation = Get-Location
Invoke-Action -Description "Install dependencies in temporary directory" -Action {
    Write-Host "Installing dependencies in temporary directory..." -ForegroundColor Yellow
    try {
        # Store current location
        $currentLocation = Get-Location
        
        # Change to temp directory
        Set-Location -Path $tempDir -ErrorAction Stop
        
        # Verify we're in the right place and have package.json
        if (-not (Test-Path package.json)) {
            throw "package.json not found in temporary directory"
        }
        
        # Run npm install
        $npmInstallResult = npm install --legacy-peer-deps --force 2>&1
        if ($LASTEXITCODE -ne 0) {
            throw "npm install failed: $npmInstallResult"
        }
    }
    catch {
        Write-Host "ERROR: Failed during npm install!" -ForegroundColor Red
        Write-Host $_.Exception.Message
        # Make sure we return to original directory
        Set-Location -Path $currentLocation
        exit 1
    }
    finally {
        # Always return to original directory
        Set-Location -Path $currentLocation
    }
}

# Move successful installation back
Invoke-Action -Description "Move installed node_modules back to project root" -Action {
    Write-Host "Moving successful installation back..." -ForegroundColor Yellow
    try {
        if (Test-Path "$tempDir\node_modules") {
            Remove-DirectorySafely "node_modules"
            Move-Item -Path "$tempDir\node_modules" -Destination "." -Force -ErrorAction Stop
            Remove-DirectorySafely $tempDir
            Write-Host "Dependency cleanup and reinstallation complete!" -ForegroundColor Green
        }
        else {
            throw "node_modules directory not found in temporary directory"
        }
    }
    catch {
        Write-Host "ERROR: Failed to move node_modules back!" -ForegroundColor Red
        Write-Host $_.Exception.Message
        Write-Host "Installation may have failed. Please check the logs above." -ForegroundColor Red
        exit 1
    }
} 