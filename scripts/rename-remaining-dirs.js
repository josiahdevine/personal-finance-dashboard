/**
 * Script to rename the remaining directories that need to be standardized
 * This is a more direct approach to finish the standardization process
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COMPONENTS_DIR = path.join(__dirname, '../src/components');

console.log(`Starting final renames for component directory standardization...`);

// List of specific directories still needing renaming
const directoriesToRename = [
  // Top-level directories
  ['Accounts', 'accounts'],
  ['Analytics', 'analytics'],
  ['Budget', 'budget'],
  ['Charts', 'charts'],
  ['Dashboard', 'dashboard'],
  ['Investments', 'investments'],
  ['Landing', 'landing'],
  ['Loading', 'loading'],
  ['Notifications', 'notifications'],
  ['Subscriptions', 'subscriptions'],
  // Common subdirectories
  ['common/Alert', 'common/alert'], 
  ['common/Badge', 'common/badge'],
  ['common/Button', 'common/button'],
  ['common/Card', 'common/card'],
  ['common/Form', 'common/form'],
  ['common/Heading', 'common/heading'],
  ['common/Select', 'common/select'],
  ['common/Skeleton', 'common/skeleton'],
  ['common/Spinner', 'common/spinner'],
  ['common/Switch', 'common/switch'],
  ['common/Table', 'common/table'],
  ['common/Text', 'common/text'],
  ['common/Toggle', 'common/toggle'],
  ['common/Widget', 'common/widget'],
  // Other nested directories
  ['Dashboard/Charts', 'dashboard/charts'],
];

// Track successes and failures
const successful = [];
const failed = [];

/**
 * Force rename directory by using a temporary directory name first
 */
function forceRename(oldPath, newPath) {
  console.log(`Renaming: ${oldPath} → ${newPath}`);
  
  try {
    if (!fs.existsSync(oldPath)) {
      console.log(`  ⚠️ Source directory ${oldPath} does not exist, skipping.`);
      failed.push([oldPath, newPath, 'Source directory does not exist']);
      return false;
    }
    
    // If target already exists, remove it or rename existing directory
    if (fs.existsSync(newPath)) {
      try {
        const backupPath = `${newPath}_backup_${Date.now()}`;
        console.log(`  Target ${newPath} already exists, moving to backup: ${backupPath}`);
        fs.renameSync(newPath, backupPath);
      } catch (error) {
        console.error(`  ❌ Failed to move existing directory: ${error.message}`);
        failed.push([oldPath, newPath, `Failed to move existing directory: ${error.message}`]);
        return false;
      }
    }
    
    // Ensure parent directory exists
    const parentDir = path.dirname(newPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    
    // Try to use git move to preserve history
    try {
      execSync(`git mv "${oldPath}" "${newPath}"`, { stdio: 'pipe' });
      console.log(`  ✅ Successfully renamed using git mv`);
      successful.push([oldPath, newPath]);
      return true;
    } catch (gitError) {
      // Fall back to regular move if git fails
      try {
        console.log(`  Falling back to fs.renameSync`);
        fs.renameSync(oldPath, newPath);
        console.log(`  ✅ Successfully renamed using fs.renameSync`);
        successful.push([oldPath, newPath]);
        return true;
      } catch (fsError) {
        console.error(`  ❌ Failed to rename: ${fsError.message}`);
        failed.push([oldPath, newPath, fsError.message]);
        return false;
      }
    }
  } catch (error) {
    console.error(`  ❌ Unexpected error: ${error.message}`);
    failed.push([oldPath, newPath, error.message]);
    return false;
  }
}

// Execute renames
let successCount = 0;
let failCount = 0;

for (const [oldRelPath, newRelPath] of directoriesToRename) {
  const oldPath = path.join(COMPONENTS_DIR, oldRelPath);
  const newPath = path.join(COMPONENTS_DIR, newRelPath);
  
  const result = forceRename(oldPath, newPath);
  if (result) {
    successCount++;
  } else {
    failCount++;
  }
}

// Print summary
console.log('\nRename operations completed');
console.log(`  Successful: ${successCount}`);
console.log(`  Failed: ${failCount}`);

if (failCount > 0) {
  console.log('\nFailed operations:');
  failed.forEach(([oldPath, newPath, reason]) => {
    console.log(`  ${oldPath} → ${newPath}: ${reason}`);
  });
}

console.log('\nNext steps:');
console.log('1. Run npm run component:analyze to verify structure');
console.log('2. Run npm run component:imports to update import paths');
console.log('3. Test the application to ensure everything works correctly'); 