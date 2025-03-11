/**
 * Script to update import paths after component directory structure changes
 * This should be run after fix-component-structure.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.join(__dirname, '..');
const DRY_RUN = process.argv.includes('--dry-run');

// Read the changes report
let changesReport = {};
try {
  const reportPath = path.join(PROJECT_ROOT, 'component-structure-changes.json');
  if (fs.existsSync(reportPath)) {
    changesReport = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    
    // If the fix script was run in dry-run mode, make this script run in dry-run mode as well
    if (changesReport.dryRun === true && !DRY_RUN) {
      console.log('The component structure changes were only a dry run. Running import updates in dry run mode as well.');
      process.argv.push('--dry-run');
      DRY_RUN = true;
    }
  } else {
    console.error('Component structure changes report not found. Run fix-component-structure.js first.');
    process.exit(1);
  }
} catch (error) {
  console.error('Error reading changes report:', error.message);
  process.exit(1);
}

// Extract paths to update
const pathUpdates = new Map();
for (const [oldPath, newPath] of Object.entries(changesReport.renamedDirectories || {})) {
  // Convert to relative import paths (from project root)
  const oldImportPath = oldPath.replace(PROJECT_ROOT, '').replace(/\\/g, '/');
  const newImportPath = newPath.replace(PROJECT_ROOT, '').replace(/\\/g, '/');
  
  // Format as import paths - remove leading slashes
  const formattedOldPath = oldImportPath.startsWith('/') ? oldImportPath.slice(1) : oldImportPath;
  const formattedNewPath = newImportPath.startsWith('/') ? newImportPath.slice(1) : newImportPath;
  
  pathUpdates.set(formattedOldPath, formattedNewPath);
  
  // Add variations for different import styles
  // Handle trailing index.tsx, index.ts, etc.
  pathUpdates.set(`${formattedOldPath}/index`, `${formattedNewPath}/index`);
}

console.log('Import path mappings:');
for (const [oldPath, newPath] of pathUpdates.entries()) {
  console.log(`  ${oldPath} → ${newPath}`);
}

// Find all TypeScript and JavaScript files
console.log('\nSearching for source files...');
const sourceFiles = glob.sync('src/**/*.{ts,tsx,js,jsx}', { cwd: PROJECT_ROOT });
console.log(`Found ${sourceFiles.length} source files to process.`);

let updatedFiles = 0;
let skippedFiles = 0;

// Process each file
for (const relativeFilePath of sourceFiles) {
  const filePath = path.join(PROJECT_ROOT, relativeFilePath);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    let fileUpdated = false;
    
    // Regular expression to match imports/requires
    const importRegex = /(?:import|from|require\()\s+['"]([^'"]+)['"]/g;
    
    // Collect all imports that need to be updated
    const updatedImports = new Map();
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];
      
      // Check if this import needs to be updated
      for (const [oldPath, newPath] of pathUpdates.entries()) {
        if (importPath.includes(oldPath)) {
          // Replace the old path with the new path
          const updatedImport = importPath.replace(oldPath, newPath);
          updatedImports.set(importPath, updatedImport);
          break;
        }
      }
    }
    
    // Apply the updates
    if (updatedImports.size > 0) {
      console.log(`Updating imports in ${relativeFilePath}:`);
      
      // Sort by length (longest first) to avoid partial replacements
      const sortedImports = [...updatedImports.entries()]
        .sort((a, b) => b[0].length - a[0].length);
      
      for (const [oldImport, newImport] of sortedImports) {
        console.log(`  ${oldImport} → ${newImport}`);
        
        const importRegex = new RegExp(`((?:import|from|require\\()\\s+['"])${oldImport}(['"])`, 'g');
        newContent = newContent.replace(importRegex, `$1${newImport}$2`);
        fileUpdated = true;
      }
      
      if (!DRY_RUN && fileUpdated) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        updatedFiles++;
      } else if (DRY_RUN && fileUpdated) {
        updatedFiles++;
      }
    } else {
      skippedFiles++;
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

console.log(`\nSummary:`);
console.log(`  Updated: ${DRY_RUN ? updatedFiles + ' (dry run)' : updatedFiles} files`);
console.log(`  Skipped: ${skippedFiles} files (no changes needed)`);

if (DRY_RUN) {
  console.log('\nThis was a dry run. No files were modified. Run without --dry-run to apply changes.');
} 