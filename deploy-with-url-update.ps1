# PowerShell script to deploy site with updated domain URLs

Write-Host "=== Deploying Personal Finance Dashboard with updated domain URLs ===" -ForegroundColor Green
Write-Host ""

# 1. Build the application
Write-Host "[1/4] Building the application..." -ForegroundColor Green
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed. Please check for errors and try again." -ForegroundColor Red
    exit 1
}

# 2. Commit the changes
Write-Host "[2/4] Committing changes..." -ForegroundColor Green
git add .
git commit -m "Update to use trypersonalfinance.com domain and fix Stripe CSP issues"

# 3. Push to GitHub
Write-Host "[3/4] Pushing to GitHub..." -ForegroundColor Green
git push origin master

# 4. Deploy to Netlify
Write-Host "[4/4] Deploying to Netlify..." -ForegroundColor Green
netlify deploy --prod --message "Update domain URLs and fix Stripe CSP"

Write-Host ""
Write-Host "=== Deployment completed ===" -ForegroundColor Green
Write-Host "Your site should now be using trypersonalfinance.com domain references." -ForegroundColor Yellow
Write-Host "Remember to update your DNS settings if not already configured." -ForegroundColor Yellow
Write-Host ""
Write-Host "Stripe Configuration Checklist:" -ForegroundColor Cyan
Write-Host "1. Set REACT_APP_STRIPE_PUBLISHABLE_KEY in your environment variables" -ForegroundColor White
Write-Host "2. Set STRIPE_SECRET_KEY in your server environment" -ForegroundColor White
Write-Host "3. Configure Stripe webhook at https://dashboard.stripe.com/webhooks" -ForegroundColor White
Write-Host "   - Endpoint URL: https://api.trypersonalfinance.com/api/payments/webhook" -ForegroundColor White
Write-Host "   - Events: invoice.payment_succeeded, invoice.payment_failed," -ForegroundColor White
Write-Host "     customer.subscription.updated, customer.subscription.deleted" -ForegroundColor White 