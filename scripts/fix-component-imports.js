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