/**
 * Import Path Standardization Script
 * 
 * This script helps standardize import paths in the codebase to address case sensitivity issues.
 * It provides a list of problematic import patterns and their correct replacements.
 * 
 * Usage:
 * 1. Review the paths listed below
 * 2. Run a search and replace across your codebase for each pattern
 * 
 * Important: Always use lowercase for directory names in imports to ensure consistency
 * 
 * Examples:
 * ❌ import { Component } from '../Components/path'  <- Incorrect (uppercase C)
 * ✅ import { Component } from '../components/path'  <- Correct (lowercase c)
 */

const problematicPaths = [
  {
    pattern: /from ['"].*\/Components\//g,
    replace: (match) => match.replace('/Components/', '/components/'),
    description: 'Uppercase "Components" directory in imports'
  },
  {
    pattern: /from ['"].*\/Charts\//g,
    replace: (match) => match.replace('/Charts/', '/charts/'),
    description: 'Uppercase "Charts" directory in imports'
  },
  {
    pattern: /from ['"].*\/Components\/ui\//g,
    replace: (match) => match.replace('/Components/ui/', '/components/ui/'),
    description: 'Uppercase "Components/ui" path in imports'
  },
  {
    pattern: /from ['"].*\/Components\/ErrorBoundary/g,
    replace: (match) => match.replace('/Components/ErrorBoundary', '/components/ErrorBoundary'),
    description: 'Uppercase "Components/ErrorBoundary" in imports'
  },
  {
    pattern: /from ['"].*\/Components\/plaid\//g,
    replace: (match) => match.replace('/Components/plaid/', '/components/plaid/'),
    description: 'Uppercase "Components/plaid" path in imports'
  },
  {
    pattern: /from ['"].*\/Components\/common\//g,
    replace: (match) => match.replace('/Components/common/', '/components/common/'),
    description: 'Uppercase "Components/common" path in imports'
  }
];

console.log('--------------------------------------------------------');
console.log('Import Path Standardization Guide');
console.log('--------------------------------------------------------');
console.log('To fix case sensitivity issues in import paths, perform these search and replace operations:');
console.log('');

problematicPaths.forEach((item, index) => {
  console.log(`${index + 1}. ${item.description}`);
  console.log(`   Search:  ${item.pattern}`);
  console.log(`   Replace with lowercase 'components'`);
  console.log('');
});

console.log('--------------------------------------------------------');
console.log('Recommended standardized directory structure:');
console.log('--------------------------------------------------------');
console.log(`
src/
├── components/          <-- Always lowercase
│   ├── common/          <-- Always lowercase
│   ├── features/        <-- Always lowercase
│   │   ├── budget/      <-- Always lowercase
│   │   ├── plaid/       <-- Always lowercase
│   │   └── ...
│   └── ui/              <-- Always lowercase
├── pages/               <-- Always lowercase
└── ...
`);
console.log('--------------------------------------------------------');
console.log('After fixing imports, test your build with:');
console.log('npm run build');
console.log('--------------------------------------------------------');

#!/usr/bin/env node

/**
 * This script automatically fixes common import issues in the codebase.
 * It replaces named imports with default imports for components that are
 * exported as default exports.
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Components that should be imported as default (not using destructuring)
const DEFAULT_IMPORTS = [
  { pattern: /import\s*{\s*Button\s*}\s*from\s*['"](.*)\/button\/Button['"]/g, replacement: 'import Button from "$1/button/Button"' },
  { pattern: /import\s*{\s*Card\s*}\s*from\s*['"](.*)\/card\/Card['"]/g, replacement: 'import Card from "$1/card/Card"' },
  { pattern: /import\s*{\s*LineChart\s*}\s*from\s*['"](.*)\/charts\/LineChart['"]/g, replacement: 'import LineChart from "$1/charts/LineChart"' },
  { pattern: /import\s*{\s*PieChart\s*}\s*from\s*['"](.*)\/charts\/PieChart['"]/g, replacement: 'import PieChart from "$1/charts/PieChart"' },
  { pattern: /import\s*{\s*Badge\s*}\s*from\s*['"](.*)\/badge\/Badge['"]/g, replacement: 'import Badge from "$1/badge/Badge"' },
  { pattern: /import\s*{\s*DataTable\s*}\s*from\s*['"](.*)\/data-table\/DataTable['"]/g, replacement: 'import DataTable from "$1/data-table/DataTable"' },
  // Add more patterns as needed
];

// Find all TypeScript and JavaScript files in the src directory
async function findFiles() {
  try {
    return await glob('src/**/*.{ts,tsx,js,jsx}', { ignore: 'node_modules/**' });
  } catch (error) {
    console.error('Error finding files:', error);
    return [];
  }
}

// Process a single file
function processFile(filePath) {
  try {
    // Read the file content
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Apply each import pattern replacement
    DEFAULT_IMPORTS.forEach(({ pattern, replacement }) => {
      const originalContent = content;
      content = content.replace(pattern, replacement);
      
      if (originalContent !== content) {
        modified = true;
      }
    });

    // If the file was modified, write it back
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed imports in: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
}

// Main function
async function main() {
  const files = await findFiles();
  console.log(`Found ${files.length} files to process`);

  // Process each file
  for (const file of files) {
    processFile(file);
  }

  console.log('Import fixing complete!');
}

main().catch(console.error); 