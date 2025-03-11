/**
 * Script to fix component directory structure based on analysis
 * This script reorganizes components to follow standardized naming conventions:
 * - Directory names: kebab-case
 * - Component files: PascalCase
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COMPONENTS_DIR = path.join(__dirname, '../src/components');
const DRY_RUN = process.argv.includes('--dry-run');

// Map of case transformations
const transformations = {
  kebabCase: (str) => str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(),
  pascalCase: (str) => {
    const kebab = str.toLowerCase().split('-');
    return kebab.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
  }
};

console.log(`Starting component structure standardization${DRY_RUN ? ' (DRY RUN)' : ''}...`);

// Structure mappings
// This maps current directories to their new location and format
const structureMapping = {
  'Charts': 'charts',
  'Charts/BarChart': 'charts/bar-chart',
  'Charts/LineChart': 'charts/line-chart',
  'Charts/PieChart': 'charts/pie-chart',
  'Accounts': 'features/accounts',
  'Analytics': 'features/analytics',
  'AskAI': 'features/ask-ai',
  'Bills': 'features/bills',
  'Budget': 'features/budget',
  'PlaidLink': 'features/plaid/plaid-link',
  // Common components with PascalCase names
  'common/Alert': 'common/alert',
  'common/Badge': 'common/badge',
  'common/Button': 'common/button',
  'common/Card': 'common/card',
  'common/Form': 'common/form',
  'common/Heading': 'common/heading',
  'common/Select': 'common/select',
  'common/Skeleton': 'common/skeleton',
  'common/Spinner': 'common/spinner',
  'common/Switch': 'common/switch',
  'common/Table': 'common/table',
  'common/Text': 'common/text',
  'common/Toggle': 'common/toggle',
  'common/Widget': 'common/widget',
  // Other components
  'Dashboard': 'dashboard',
  'Dashboard/Charts': 'dashboard/charts',
  'Investments': 'investments',
  'Landing': 'landing',
  'Loading': 'loading',
  'Notifications': 'notifications',
  'Subscriptions': 'subscriptions',
};

// Keep track of changes for report and import updates
const renamedDirs = new Map();
const renamedFiles = new Map();

/**
 * Renames a directory with proper git handling to track history
 */
function renameDir(oldPath, newPath) {
  if (!fs.existsSync(oldPath)) {
    console.log(`⚠️ Directory ${oldPath} does not exist, skipping.`);
    return false;
  }

  if (fs.existsSync(newPath)) {
    console.log(`⚠️ Directory ${newPath} already exists, skipping to avoid conflicts.`);
    return false;
  }

  console.log(`Renaming directory: ${oldPath} → ${newPath}`);
  
  if (!DRY_RUN) {
    // Ensure parent directory exists
    const parentDir = path.dirname(newPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    
    try {
      // Use git move to preserve history
      try {
        execSync(`git mv "${oldPath}" "${newPath}"`, { stdio: 'pipe' });
      } catch (gitError) {
        console.log(`  Falling back to regular rename for ${oldPath}`);
        fs.renameSync(oldPath, newPath);
      }
      
      renamedDirs.set(oldPath, newPath);
      return true;
    } catch (error) {
      console.error(`  Error renaming directory: ${error.message}`);
      return false;
    }
  } else {
    // In dry run mode, still record the rename for reporting
    renamedDirs.set(oldPath, newPath);
  }
  
  return true;
}

/**
 * Process directory structure according to mapping
 */
function processDirectoryMappings() {
  // Sort by depth (deepest first) to avoid parent directory moves affecting children
  const mappingEntries = Object.entries(structureMapping)
    .sort((a, b) => b[0].split('/').length - a[0].split('/').length);
  
  for (const [currentPath, newPath] of mappingEntries) {
    const fullOldPath = path.join(COMPONENTS_DIR, currentPath);
    const fullNewPath = path.join(COMPONENTS_DIR, newPath);
    
    if (fs.existsSync(fullOldPath)) {
      renameDir(fullOldPath, fullNewPath);
    }
  }
}

/**
 * Scans directories to fix casing for any unmapped directories
 */
function scanAndFixDirectories(dir) {
  console.log(`\nScanning directory: ${dir}`);
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        // Check if directory name is kebab-case
        const kebabCaseName = transformations.kebabCase(item);
        
        if (item !== kebabCaseName) {
          const newPath = path.join(dir, kebabCaseName);
          renameDir(itemPath, newPath);
          
          // Continue scanning with the new path if renamed
          scanAndFixDirectories(newPath);
        } else {
          // Continue scanning with the current path
          scanAndFixDirectories(itemPath);
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory: ${dir}`, error);
  }
}

/**
 * Creates a report of all the changes made
 */
function createChangeReport() {
  const reportData = {
    renamedDirectories: Object.fromEntries(renamedDirs),
    renamedFiles: Object.fromEntries(renamedFiles),
    timestamp: new Date().toISOString(),
    dryRun: DRY_RUN
  };
  
  const reportPath = path.join(__dirname, '../component-structure-changes.json');
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
  console.log(`Change report written to: ${reportPath}`);
}

// Execute the structure changes
processDirectoryMappings();
scanAndFixDirectories(COMPONENTS_DIR);

// Create a report of changes
createChangeReport();

console.log('\nNext steps:');
console.log('1. Run the update-imports.js script to fix imports');
console.log('2. Test the application to ensure everything works correctly');
console.log('3. Commit the changes with git');

if (DRY_RUN) {
  console.log('\nThis was a dry run. No files were modified. Run without --dry-run to apply changes.');
} 