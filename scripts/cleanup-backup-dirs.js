/**
 * Script to clean up backup directories created during the component standardization process
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.join(__dirname, '..');

console.log('Starting cleanup of backup directories...');

// Find all backup directories
const backupPattern = 'src/components/**/*_backup_*';
console.log(`Searching for backup directories matching: ${backupPattern}`);

const backupDirs = glob.sync(backupPattern, { cwd: PROJECT_ROOT });

if (backupDirs.length === 0) {
  console.log('No backup directories found.');
  process.exit(0);
}

console.log(`Found ${backupDirs.length} backup directories:`);
backupDirs.forEach(dir => console.log(`  ${dir}`));

// Confirm before removing
const DRY_RUN = process.argv.includes('--dry-run');
if (DRY_RUN) {
  console.log('\nThis is a dry run. The directories will not be deleted.');
  console.log('Run without --dry-run to actually delete the directories.');
  process.exit(0);
}

// Remove the directories
console.log('\nRemoving backup directories...');

let successCount = 0;
let failCount = 0;

for (const relPath of backupDirs) {
  const fullPath = path.join(PROJECT_ROOT, relPath);
  console.log(`Removing: ${relPath}...`);
  
  try {
    // Use a recursive function to delete directory and all its contents
    function deleteDirRecursive(dirPath) {
      if (fs.existsSync(dirPath)) {
        fs.readdirSync(dirPath).forEach(file => {
          const curPath = path.join(dirPath, file);
          if (fs.lstatSync(curPath).isDirectory()) {
            // Recursive delete directory
            deleteDirRecursive(curPath);
          } else {
            // Delete file
            fs.unlinkSync(curPath);
          }
        });
        // Delete empty directory
        fs.rmdirSync(dirPath);
      }
    }
    
    deleteDirRecursive(fullPath);
    console.log(`  ✅ Successfully removed`);
    successCount++;
  } catch (error) {
    console.error(`  ❌ Failed to remove: ${error.message}`);
    failCount++;
  }
}

// Print summary
console.log('\nCleanup complete');
console.log(`  Successfully removed: ${successCount}`);
console.log(`  Failed to remove: ${failCount}`);

if (failCount > 0) {
  console.log('\nSome directories could not be removed. You may need to remove them manually.');
  process.exit(1);
} else {
  console.log('\nAll backup directories have been successfully removed.');
} 