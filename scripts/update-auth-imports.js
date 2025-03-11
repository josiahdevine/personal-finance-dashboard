/**
 * Script to update all AuthContext imports to use the TypeScript implementation
 * This ensures consistent usage of the AuthContext throughout the codebase
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

console.log(`${DRY_RUN ? '[DRY RUN] ' : ''}Starting AuthContext import standardization...`);

// Import patterns to search for and replace
const importPatterns = [
  // Match single-quote imports from context/AuthContext (singular)
  {
    regex: /from ['"](.*)\/context\/AuthContext['"]/g,
    replacement: (match, p1) => `from '${p1}/contexts/AuthContext'`
  },
  // Match double-quote imports from context/AuthContext (singular)
  {
    regex: /from [""](.*)\/context\/AuthContext[""]/g,
    replacement: (match, p1) => `from "${p1}/contexts/AuthContext"`
  }
];

// Find all TypeScript and JavaScript files
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
    
    // Check if this file contains any AuthContext imports
    const hasAuthContextImport = 
      /AuthContext/i.test(content) && 
      (/from.*context\/AuthContext/i.test(content) || /from.*contexts\/AuthContext/i.test(content));
    
    if (!hasAuthContextImport) {
      skippedFiles++;
      continue;
    }
    
    // Check if this is one of the deprecated files we want to preserve
    const isDeprecatedFile = relativeFilePath === 'src/context/AuthContext.tsx' || 
                            relativeFilePath === 'src/contexts/AuthContext.js';
    
    if (isDeprecatedFile) {
      console.log(`Skipping deprecated file: ${relativeFilePath}`);
      skippedFiles++;
      continue;
    }
    
    // Apply each pattern
    for (const pattern of importPatterns) {
      if (pattern.regex.test(newContent)) {
        const originalContent = newContent;
        newContent = newContent.replace(pattern.regex, pattern.replacement);
        
        if (originalContent !== newContent) {
          fileUpdated = true;
        }
      }
    }
    
    if (fileUpdated) {
      console.log(`Updating imports in: ${relativeFilePath}`);
      
      if (!DRY_RUN) {
        fs.writeFileSync(filePath, newContent, 'utf8');
      }
      
      updatedFiles++;
    } else {
      skippedFiles++;
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

// Summary
console.log('\nImport standardization completed');
console.log(`  Files processed: ${sourceFiles.length}`);
console.log(`  ${DRY_RUN ? 'Would update' : 'Updated'}: ${updatedFiles}`);
console.log(`  Skipped: ${skippedFiles}`);

if (DRY_RUN) {
  console.log('\nThis was a dry run. No files were modified.');
  console.log('Run without --dry-run to apply the changes.');
} else {
  console.log('\nAll AuthContext imports have been standardized.');
}

console.log('\nNext steps:');
console.log('1. Test the application to ensure everything still works correctly');
console.log('2. Run npm run deprecated:remove to remove deprecated AuthContext files'); 