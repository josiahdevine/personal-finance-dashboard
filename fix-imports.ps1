# Script to fix case sensitivity in import paths
Write-Host "Searching for files with incorrect import paths..."

$jsFiles = Get-ChildItem -Path "src/pages" -Recurse -Include "*.js"
$count = 0

foreach ($file in $jsFiles) {
    $content = Get-Content -Path $file.FullName -Raw
    
    if ($content -match "from '../components/") {
        Write-Host "Found file: $($file.FullName)"
        
        $newContent = $content -replace "from '../components/", "from '../Components/"
        Set-Content -Path $file.FullName -Value $newContent
        
        $count++
        Write-Host "Fixed: $($file.FullName)"
    }
}

Write-Host "Done! Fixed $count files." 