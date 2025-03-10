# Script to fix case sensitivity in import paths for TS files
Write-Host "Searching for TypeScript files with incorrect import paths..."

$tsFiles = Get-ChildItem -Path "src" -Recurse -Include "*.ts", "*.tsx" -Exclude "*node_modules*"
$count = 0

foreach ($file in $tsFiles) {
    $content = Get-Content -Path $file.FullName -Raw
    
    if ($content -match "from '../components/") {
        Write-Host "Found file: $($file.FullName)"
        
        $newContent = $content -replace "from '../components/", "from '../Components/"
        Set-Content -Path $file.FullName -Value $newContent
        
        $count++
        Write-Host "Fixed: $($file.FullName)"
    }
}

Write-Host "Done! Fixed $count TypeScript files." 