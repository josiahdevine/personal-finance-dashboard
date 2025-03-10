# Simple script to fix component import path case sensitivity
Write-Host "Fixing import paths for case sensitivity..." -ForegroundColor Cyan

$fileExtensions = @("*.ts", "*.tsx", "*.js", "*.jsx")
$count = 0

# Get all JS/TS files recursively
$files = Get-ChildItem -Path "src" -Recurse -Include $fileExtensions

foreach ($file in $files) {
    # Read the file as an array of strings (lines)
    $content = Get-Content -Path $file.FullName
    $originalContent = $content -join "`n"
    
    # Convert to a single string for comparison
    $contentString = $content -join "`n"
    
    # Simple string replacements - less prone to regex errors
    $contentString = $contentString.Replace("from '../components/", "from '../Components/")
    $contentString = $contentString.Replace('from "../components/', 'from "../Components/')
    $contentString = $contentString.Replace("from '../../components/", "from '../../Components/")
    $contentString = $contentString.Replace('from "../../components/', 'from "../../Components/')
    
    # For imports that might not use the 'from' keyword
    $contentString = $contentString.Replace("'../components/", "'../Components/")
    $contentString = $contentString.Replace('"../components/', '"../Components/')
    $contentString = $contentString.Replace("'../../components/", "'../../Components/")
    $contentString = $contentString.Replace('"../../components/', '"../../Components/')
    
    # Specifically target the BillForm import that's causing issues
    $contentString = $contentString.Replace("../../components/Bills/BillForm", "../../Components/Bills/BillForm")
    
    # Only write back if changes were made
    if ($contentString -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $contentString
        $count++
        Write-Host "  ✅ Fixed import paths in: $($file.FullName)" -ForegroundColor Green
    }
}

Write-Host "`n🎉 Done! Fixed import paths in $count files." -ForegroundColor Cyan 