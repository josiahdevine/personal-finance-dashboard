/**
 * Script to remove deprecated components that have been identified
 * Use this after verifying no components rely on the deprecated ones
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.join(__dirname, '..');
const DRY_RUN = process.argv.includes('--dry-run');

// List of deprecated components to remove
const DEPRECATED_COMPONENTS = [
  'src/contexts/ThemeContext.js',
  'src/contexts/AuthContext.js',
  'src/context/ThemeContext.tsx',
  'src/context/AuthContext.tsx',
  'src/components/PlaidLink/index.tsx',
  'src/components/plaid/PlaidLink.tsx',
  'src/components/Budget/index.tsx'
];

// Load the deprecation report if it exists to display additional information
let recommendedReplacements = {};
const reportPath = path.join(PROJECT_ROOT, 'deprecation-report.json');
if (fs.existsSync(reportPath)) {
  try {
    const reportContent = fs.readFileSync(reportPath, 'utf8');
    const deprecationReport = JSON.parse(reportContent);
    console.log('Loaded deprecation report from:', reportPath);
    
    // Extract recommended replacements if available
    if (deprecationReport.components) {
      Object.entries(deprecationReport.components).forEach(([path, info]) => {
        if (info.recommendedReplacement) {
          recommendedReplacements[path] = info.recommendedReplacement;
        }
      });
    }
  } catch (error) {
    console.warn('Warning: Could not parse deprecation report:', error.message);
  }
}

// Counter for tracking progress
let removedCount = 0;
let skippedCount = 0;
let errorCount = 0;

console.log(`${DRY_RUN ? '[DRY RUN] ' : ''}Starting removal of deprecated components...`);

// Process each component
for (const relPath of DEPRECATED_COMPONENTS) {
  const fullPath = path.join(PROJECT_ROOT, relPath);
  
  console.log(`Processing: ${relPath}`);
  
  // Display recommended replacement if available
  if (recommendedReplacements[relPath]) {
    console.log(`  ℹ️ Recommended replacement: ${recommendedReplacements[relPath]}`);
  }
  
  // Check if file exists
  if (!fs.existsSync(fullPath)) {
    console.log(`  ⚠️ File doesn't exist, skipping`);
    skippedCount++;
    continue;
  }
  
  // Create a backup of the file
  if (!DRY_RUN) {
    try {
      const backupPath = `${fullPath}.bak`;
      fs.copyFileSync(fullPath, backupPath);
      console.log(`  Created backup at: ${backupPath}`);
    } catch (error) {
      console.error(`  ❌ Failed to create backup: ${error.message}`);
      errorCount++;
      continue;
    }
  }
  
  // Check the content for deprecation notice
  let fileContent;
  try {
    fileContent = fs.readFileSync(fullPath, 'utf8');
    
    const hasDeprecationNotice = 
      fileContent.includes('@deprecated') || 
      fileContent.includes('// deprecated') || 
      fileContent.includes('/* deprecated */');
    
    if (!hasDeprecationNotice) {
      console.log(`  ⚠️ No deprecation notice found in file. Proceeding with caution.`);
    }
  } catch (error) {
    console.error(`  ❌ Failed to read file: ${error.message}`);
    errorCount++;
    continue;
  }
  
  // Delete the file
  if (!DRY_RUN) {
    try {
      fs.unlinkSync(fullPath);
      console.log(`  ✅ Successfully removed`);
      removedCount++;
    } catch (error) {
      console.error(`  ❌ Failed to remove file: ${error.message}`);
      errorCount++;
    }
  } else {
    console.log(`  Would remove file (dry run)`);
    removedCount++;
  }
}

// Print summary
console.log('\nRemoval operation completed');
console.log(`  Files processed: ${DEPRECATED_COMPONENTS.length}`);
console.log(`  ${DRY_RUN ? 'Would remove' : 'Removed'}: ${removedCount}`);
console.log(`  Skipped: ${skippedCount}`);
console.log(`  Errors: ${errorCount}`);

if (DRY_RUN) {
  console.log('\nThis was a dry run. No files were actually removed.');
  console.log('Run without --dry-run to perform the actual removal.');
} else {
  console.log('\nDeprecated components have been removed.');
  console.log('Make sure to run tests to verify application functionality is intact.');
}

console.log('\nNext steps:');
console.log('1. Run application tests to ensure everything still works correctly');
console.log('2. Update imports if any components still reference removed files');
console.log('3. Clean up any directories that might be empty after component removal'); 