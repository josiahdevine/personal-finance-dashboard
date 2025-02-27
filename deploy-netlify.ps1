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

function Log-Info {
    param([string]$Message)
    Write-ColorOutput -Message $Message -Type "INFO"
}

function Log-Success {
    param([string]$Message)
    Write-ColorOutput -Message $Message -Type "SUCCESS"
}

function Log-Warning {
    param([string]$Message)
    Write-ColorOutput -Message $Message -Type "WARNING"
}

function Log-Error {
    param([string]$Message)
    Write-ColorOutput -Message $Message -Type "ERROR"
}

# Check if Netlify CLI is installed
try {
    $netlifyCli = npm list -g netlify-cli --depth=0
    if ($netlifyCli -match "empty") {
        Log-Error "Netlify CLI is not installed."
        Log-Info "Installing Netlify CLI..."
        npm install -g netlify-cli
        
        if ($LASTEXITCODE -ne 0) {
            Log-Error "Failed to install Netlify CLI. Please install it manually with 'npm install -g netlify-cli'"
            exit 1
        } else {
            Log-Success "Netlify CLI installed successfully."
        }
    } else {
        Log-Success "Netlify CLI is already installed."
    }
} catch {
    Log-Error "Error checking Netlify CLI installation: $_"
    exit 1
}

# Check if user is logged in to Netlify
Log-Info "Checking Netlify authentication status..."
$netlifySites = netlify sites:list 2>$null

if ($LASTEXITCODE -ne 0) {
    Log-Warning "You are not logged in to Netlify."
    Log-Info "Please login to Netlify:"
    netlify login
    
    if ($LASTEXITCODE -ne 0) {
        Log-Error "Failed to login to Netlify."
        exit 1
    } else {
        Log-Success "Successfully logged in to Netlify."
    }
} else {
    Log-Success "Already authenticated with Netlify."
}

# Ensure no environment variables are committed to the repo
if (Test-Path .env) {
    Log-Warning "Found .env file - please ensure this file is in .gitignore"
    Log-Info "Checking .gitignore file..."
    
    if (Test-Path .gitignore) {
        $gitignoreContent = Get-Content .gitignore
        if ($gitignoreContent -notcontains ".env") {
            Log-Warning ".env is not in .gitignore. Adding it now..."
            Add-Content -Path .gitignore -Value ".env"
            Log-Success "Added .env to .gitignore"
        } else {
            Log-Success ".env is properly excluded in .gitignore"
        }
    } else {
        Log-Warning "No .gitignore file found. Creating one with .env..."
        Set-Content -Path .gitignore -Value ".env"
        Log-Success "Created .gitignore with .env entry"
    }
}

# Install dependencies
Log-Info "Installing dependencies..."
npm install

if ($LASTEXITCODE -ne 0) {
    Log-Error "Failed to install dependencies."
    exit 1
} else {
    Log-Success "Dependencies installed successfully."
}

# Running tests (if applicable)
Log-Info "Running tests..."
npm test -- --watchAll=false  # Run tests in non-interactive mode

if ($LASTEXITCODE -ne 0) {
    Log-Warning "Tests failed. Consider fixing tests before deployment."
    $continue = Read-Host "Continue with deployment anyway? (y/n)"
    if ($continue -ne "y") {
        Log-Info "Deployment cancelled."
        exit 1
    }
} else {
    Log-Success "Tests passed successfully."
}

# Build the application
Log-Info "Building the application..."
npm run build

if ($LASTEXITCODE -ne 0) {
    Log-Error "Build failed."
    exit 1
} else {
    Log-Success "Build completed successfully."
}

# Check if site has been initialized for Netlify
if (-not (Test-Path .netlify)) {
    Log-Info "Initializing Netlify site..."
    netlify init
    
    if ($LASTEXITCODE -ne 0) {
        Log-Error "Failed to initialize Netlify site."
        exit 1
    } else {
        Log-Success "Netlify site initialized successfully."
    }
} else {
    Log-Success "Netlify site already initialized."
}

# Deploy to Netlify
Log-Info "Deploying to Netlify..."
netlify deploy --prod

if ($LASTEXITCODE -ne 0) {
    Log-Error "Deployment failed."
    exit 1
} else {
    Log-Success "Deployment completed successfully."
}

Log-Info "Opening the deployed site..."
netlify open:site

Log-Success "Deployment process completed!"
Log-Info "Don't forget to check your application after deployment to ensure everything is working correctly."
Log-Info "You can manage your site and domain settings at https://app.netlify.com"

exit 0 