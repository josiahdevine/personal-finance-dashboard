# Script to fix case sensitivity in import paths for JS files
Write-Host "`n==============================================" -ForegroundColor Cyan
Write-Host "Import Path Case Sensitivity Fix for JS Files" -ForegroundColor Cyan
Write-Host "==============================================`n" -ForegroundColor Cyan

$fileExtensions = @("*.js")
$targetDirectory = "src/pages"
$count = 0

Write-Host "🔍 Searching for JavaScript files with incorrect import paths..." -ForegroundColor Yellow

# Get all JS files
$files = Get-ChildItem -Path $targetDirectory -Recurse -Include $fileExtensions

foreach ($file in $files) {
    # Read the content line by line
    $lines = Get-Content -Path $file.FullName
    $changed = $false
    
    # Process each line
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match "from ['`"]\.\.\/components\/") {
            Write-Host "  👉 Found incorrect import in: $($file.FullName) at line $($i+1)" -ForegroundColor Yellow
            $lines[$i] = $lines[$i] -replace "(from ['`"])\.\.\/components\/", '$1../Components/'
            $changed = $true
        }
    }
    
    # If changes were made, write back to the file
    if ($changed) {
        Set-Content -Path $file.FullName -Value $lines
        $count++
        Write-Host "  ✅ Fixed import paths in: $($file.FullName)" -ForegroundColor Green
    }
}

Write-Host "`n🎉 Done! Fixed import paths in $count files." -ForegroundColor Cyan 