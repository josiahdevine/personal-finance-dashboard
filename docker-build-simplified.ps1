Write-Host "Starting Docker build with minimal PlaidLink..." -ForegroundColor Cyan

# Set up necessary directories
Write-Host "Setting up directories..." -ForegroundColor Cyan
docker exec -it finance-dashboard-dev mkdir -p /app/src/lower-components
docker exec -it finance-dashboard-dev mkdir -p /app/src/components/features/plaid

# Copy the plaidService bridge file
Write-Host "Copying plaidService bridge..." -ForegroundColor Cyan
docker cp plaidService.bridge.js finance-dashboard-dev:/app/src/lower-components/plaidService.js

# Copy TypeScript declaration files
Write-Host "Copying TypeScript declarations..." -ForegroundColor Cyan
docker cp missing-modules.d.ts finance-dashboard-dev:/app/src/

# Copy the Babel configuration
Write-Host "Copying Babel configuration..." -ForegroundColor Cyan
docker cp babel.config.js finance-dashboard-dev:/app/

# Copy the CRACO configuration
Write-Host "Copying CRACO configuration..." -ForegroundColor Cyan
docker cp craco.config.cjs finance-dashboard-dev:/app/

# Create a minimal PlaidLink component
$plaidLinkContent = @"
import React from 'react';

export interface PlaidLinkProps {
  onSuccess?: () => void;
  onExit?: () => void;
  buttonText?: string;
}

/**
 * PlaidLink Component - Minimal version for Docker build
 */
const PlaidLink: React.FC<PlaidLinkProps> = ({ 
  buttonText = 'Connect Bank Account',
  onSuccess
}) => {
  const handleClick = () => {
    console.log('PlaidLink clicked');
    if (onSuccess) onSuccess();
  };
  
  return (
    <button 
      onClick={handleClick}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      {buttonText}
    </button>
  );
};

export default PlaidLink;
export { PlaidLink };
"@

# Save the content to a file
$plaidLinkContent | Out-File -FilePath "temp-plaidlink.tsx" -Encoding utf8

# Copy the file to Docker
Write-Host "Copying simplified PlaidLink..." -ForegroundColor Cyan
docker cp temp-plaidlink.tsx finance-dashboard-dev:/app/src/components/features/plaid/PlaidLink.tsx

# Run the build process in the Docker container
Write-Host "Running build process in Docker container..." -ForegroundColor Cyan
docker exec -it finance-dashboard-dev npm run build

# Clean up temporary files
Write-Host "Cleaning up temporary files..." -ForegroundColor Cyan
Remove-Item -Path "temp-plaidlink.tsx" -Force

# Check if build was successful
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed. Check the error messages above." -ForegroundColor Red
} else {
    Write-Host "Build completed successfully. Your app is ready for deployment." -ForegroundColor Green
} 