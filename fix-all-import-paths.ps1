# Script to fix all case sensitivity in import paths
Write-Host "`n==============================================" -ForegroundColor Cyan
Write-Host "Comprehensive Import Path Case Sensitivity Fix" -ForegroundColor Cyan
Write-Host "==============================================`n" -ForegroundColor Cyan

$fileExtensions = @("*.ts", "*.tsx", "*.js", "*.jsx")
$targetDirectory = "src"
$count = 0

Write-Host "🔍 Searching for files with incorrect import paths..." -ForegroundColor Yellow

foreach ($extension in $fileExtensions) {
    $files = Get-ChildItem -Path $targetDirectory -Recurse -Include $extension
    
    foreach ($file in $files) {
        $content = Get-Content -Path $file.FullName -Raw
        $originalContent = $content
        $changed = $false
        
        # Check if the file contains imports with lowercase 'components'
        # Handle both single-level and multi-level relative paths
        if ($content -match 'from [''"]\.\.\/components\/') {
            $content = $content -replace 'from ([''"])\.\.\/components\/', 'from $1../Components/'
            $changed = $true
        }
        
        # Check for two-level up imports
        if ($content -match 'from [''"]\.\.\/\.\.\/components\/') {
            $content = $content -replace 'from ([''"])\.\.\/\.\.\/components\/', 'from $1../../Components/'
            $changed = $true
        }
        
        # Check for direct imports without 'from'
        if ($content -match '[''"]\.\.\/components\/') {
            $content = $content -replace '([''"])\.\.\/components\/', '$1../Components/'
            $changed = $true
        }
        
        # Check for two-level direct imports without 'from'
        if ($content -match '[''"]\.\.\/\.\.\/components\/') {
            $content = $content -replace '([''"])\.\.\/\.\.\/components\/', '$1../../Components/'
            $changed = $true
        }
        
        # Only write back if changes were made
        if ($changed) {
            # Write the content back to the file
            Set-Content -Path $file.FullName -Value $content
            
            $count++
            Write-Host "  ✅ Fixed import paths in: $($file.FullName)" -ForegroundColor Green
        }
    }
}

Write-Host "`n🔎 Focusing on Dashboard files specifically..." -ForegroundColor Yellow
$dashboardFiles = Get-ChildItem -Path "$targetDirectory/pages/Dashboard" -Recurse -Include $fileExtensions

foreach ($file in $dashboardFiles) {
    $content = Get-Content -Path $file.FullName -Raw
    $originalContent = $content
    
    # Specifically look for the '../../components/Bills/BillForm' pattern
    if ($content -match '[''"]\.\.\/\.\.\/components\/Bills\/BillForm') {
        $content = $content -replace '([''"])\.\.\/\.\.\/components\/Bills\/BillForm', '$1../../Components/Bills/BillForm'
        
        # Write the content back to the file
        Set-Content -Path $file.FullName -Value $content
        
        Write-Host "  🛠️ Fixed BillForm import in: $($file.FullName)" -ForegroundColor Green
        $count++
    }
}

Write-Host "`n🎉 Done! Fixed import paths in $count files." -ForegroundColor Cyan
Write-Host "Remember to commit and push these changes to fix the Netlify build." -ForegroundColor Cyan 