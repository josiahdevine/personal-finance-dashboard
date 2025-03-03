# Personal Finance Dashboard - Netlify Deployment Script for Windows
# This PowerShell script builds and deploys the application to Netlify

# Text colors
function Write-ColorOutput {
    param (
        [Parameter(Mandatory = $true)]
        [string]$Message,
        
        [Parameter(Mandatory = $true)]
        [string]$Type
    )
    
    $color = switch ($Type) {
        "INFO" { "Cyan" }
        "SUCCESS" { "Green" }
        "WARNING" { "Yellow" }
        "ERROR" { "Red" }
        default { "White" }
    }
    
    Write-Host "[$Type] $Message" -ForegroundColor $color
}

function Write-InfoLog {
    param(
        [string]$Message
    )
    Write-Host "[INFO] $Message" -ForegroundColor Cyan
}

function Write-SuccessLog {
    param(
        [string]$Message
    )
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-WarningLog {
    param(
        [string]$Message
    )
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-ErrorLog {
    param(
        [string]$Message
    )
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if Netlify CLI is installed
try {
    $netlifyCli = npm list -g netlify-cli --depth=0
    if ($netlifyCli -match "empty") {
        Write-ErrorLog "Netlify CLI is not installed."
        Write-InfoLog "Installing Netlify CLI..."
        npm install -g netlify-cli
        
        if ($LASTEXITCODE -ne 0) {
            Write-ErrorLog "Failed to install Netlify CLI. Please install it manually with 'npm install -g netlify-cli'"
            exit 1
        } else {
            Write-SuccessLog "Netlify CLI installed successfully."
        }
    } else {
        Write-SuccessLog "Netlify CLI is already installed."
    }
} catch {
    Write-ErrorLog "Error checking Netlify CLI installation: $_"
    exit 1
}

# Check if user is logged in to Netlify
Write-InfoLog "Checking Netlify authentication status..."
$script:netlifySiteList = netlify sites:list 2>$null

if ($LASTEXITCODE -ne 0) {
    Write-WarningLog "You are not logged in to Netlify."
    Write-InfoLog "Please login to Netlify:"
    netlify login
    
    if ($LASTEXITCODE -ne 0) {
        Write-ErrorLog "Failed to login to Netlify."
        exit 1
    } else {
        Write-SuccessLog "Successfully logged in to Netlify."
    }
} else {
    Write-SuccessLog "Already authenticated with Netlify."
}

# Ensure no environment variables are committed to the repo
if (Test-Path .env) {
    Write-WarningLog "Found .env file - please ensure this file is in .gitignore"
    Write-InfoLog "Checking .gitignore file..."
    
    if (Test-Path .gitignore) {
        $gitignoreContent = Get-Content .gitignore
        if ($gitignoreContent -notcontains ".env") {
            Write-WarningLog ".env is not in .gitignore. Adding it now..."
            Add-Content -Path .gitignore -Value ".env"
            Write-SuccessLog "Added .env to .gitignore"
        } else {
            Write-SuccessLog ".env is properly excluded in .gitignore"
        }
    } else {
        Write-WarningLog "No .gitignore file found. Creating one with .env..."
        Set-Content -Path .gitignore -Value ".env"
        Write-SuccessLog "Created .gitignore with .env entry"
    }
}

# Install dependencies
Write-InfoLog "Installing dependencies..."
npm install

if ($LASTEXITCODE -ne 0) {
    Write-ErrorLog "Failed to install dependencies."
    exit 1
} else {
    Write-SuccessLog "Dependencies installed successfully."
}

# Running tests (if applicable)
Write-InfoLog "Running tests..."
npm test -- --watchAll=false  # Run tests in non-interactive mode

if ($LASTEXITCODE -ne 0) {
    Write-WarningLog "Tests failed. Consider fixing tests before deployment."
    $continue = Read-Host "Continue with deployment anyway? (y/n)"
    if ($continue -ne "y") {
        Write-InfoLog "Deployment cancelled."
        exit 1
    }
} else {
    Write-SuccessLog "Tests passed successfully."
}

# Build the application
Write-InfoLog "Building the application..."
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-ErrorLog "Build failed."
    exit 1
} else {
    Write-SuccessLog "Build completed successfully."
}

# Check if site has been initialized for Netlify
if (-not (Test-Path .netlify)) {
    Write-InfoLog "Initializing Netlify site..."
    netlify init
    
    if ($LASTEXITCODE -ne 0) {
        Write-ErrorLog "Failed to initialize Netlify site."
        exit 1
    } else {
        Write-SuccessLog "Netlify site initialized successfully."
    }
} else {
    Write-SuccessLog "Netlify site already initialized."
}

# Deploy to Netlify
Write-InfoLog "Deploying to Netlify..."
netlify deploy --prod

if ($LASTEXITCODE -ne 0) {
    Write-ErrorLog "Deployment failed."
    exit 1
} else {
    Write-SuccessLog "Deployment completed successfully."
}

Write-InfoLog "Opening the deployed site..."
netlify open:site

Write-SuccessLog "Deployment process completed!"
Write-InfoLog "Don't forget to check your application after deployment to ensure everything is working correctly."
Write-InfoLog "You can manage your site and domain settings at https://app.netlify.com"

exit 0 