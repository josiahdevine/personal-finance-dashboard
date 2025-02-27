# PowerShell script to commit changes, push to GitHub, and deploy to Netlify

# Display header
Write-Host "=== Personal Finance Dashboard Deployment ===" -ForegroundColor Green
Write-Host "This script will commit your changes, push to GitHub, and deploy to Netlify" -ForegroundColor Yellow
Write-Host ""

# 1. Add all changes to git
Write-Host "[1/5] Adding all changes to git..." -ForegroundColor Green
git add .

# 2. Commit the changes
Write-Host "[2/5] Committing changes..." -ForegroundColor Green
Write-Host "Enter a commit message (e.g., 'Add Stripe integration and mobile optimization'):" -ForegroundColor Yellow
$commit_message = Read-Host

if ([string]::IsNullOrEmpty($commit_message)) {
    $commit_message = "Update dashboard with Stripe integration and mobile optimization"
    Write-Host "Using default commit message: $commit_message" -ForegroundColor Yellow
}

git commit -m $commit_message

# 3. Push to GitHub
Write-Host "[3/5] Pushing to GitHub..." -ForegroundColor Green
git push origin main 
if ($LASTEXITCODE -ne 0) {
    Write-Host "Trying master branch instead..." -ForegroundColor Yellow
    git push origin master
}

# 4. Check if netlify-cli is installed
Write-Host "[4/5] Checking Netlify CLI..." -ForegroundColor Green
$netlifyInstalled = Get-Command netlify -ErrorAction SilentlyContinue

if (-not $netlifyInstalled) {
    Write-Host "Netlify CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g netlify-cli
}

# 5. Deploy to Netlify
Write-Host "[5/5] Deploying to Netlify..." -ForegroundColor Green
Write-Host "Choose an option:" -ForegroundColor Yellow
Write-Host "1. Deploy with Netlify CLI (requires authentication)"
Write-Host "2. Skip Netlify deployment (manual deploy from Netlify dashboard)"
$deploy_option = Read-Host "Option (1 or 2)"

if ($deploy_option -eq "1") {
    # Check if user is logged in to Netlify
    $script:netlifyStatus = netlify status 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Logging in to Netlify..." -ForegroundColor Yellow
        netlify login
    }
    
    # Deploy to Netlify
    Write-Host "Deploying to Netlify..." -ForegroundColor Yellow
    netlify deploy --prod
}
else {
    Write-Host "Skipping Netlify deployment." -ForegroundColor Yellow
    Write-Host "Please deploy manually from the Netlify dashboard:" -ForegroundColor Yellow
    Write-Host "1. Go to app.netlify.com"
    Write-Host "2. Select your site"
    Write-Host "3. Deploy manually or wait for automatic deployment if configured"
}

Write-Host ""
Write-Host "=== Deployment process completed ===" -ForegroundColor Green
Write-Host "Don't forget to check the NEXT_STEPS.md file for future tasks!" -ForegroundColor Yellow 