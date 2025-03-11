/**
 * Script to standardize component directory and file naming
 * This helps ensure consistent casing across the codebase
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COMPONENTS_DIR = path.join(__dirname, '../src/components');

// Map of case transformations
const transformations = {
  kebabCase: (str) => str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(),
  pascalCase: (str) => {
    const kebab = str.toLowerCase().split('-');
    return kebab.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
  }
};

console.log('Starting component structure analysis...');

function scanDirectory(dir) {
  console.log(`\nScanning directory: ${dir}`);
  
  try {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const itemPath = path.join(dir, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        // Check if directory name is kebab-case
        const kebabCaseName = transformations.kebabCase(item);
        
        if (item !== kebabCaseName) {
          console.log(`Directory should be renamed: ${item} → ${kebabCaseName}`);
        }
        
        // Recursively scan subdirectories
        scanDirectory(itemPath);
      } else if (stats.isFile()) {
        // Skip directories with index files for now
        if (item === 'index.ts' || item === 'index.tsx' || item === 'index.js' || item === 'index.jsx') {
          return;
        }
        
        // Check component files for PascalCase
        if (
          (item.endsWith('.tsx') || item.endsWith('.jsx')) && 
          !item.startsWith('_') && 
          !item.includes('.')
        ) {
          const baseName = path.basename(item, path.extname(item));
          const pascalCaseName = transformations.pascalCase(baseName);
          
          if (baseName !== pascalCaseName) {
            console.log(`Component file should be renamed: ${item} → ${pascalCaseName}${path.extname(item)}`);
          }
        }
      }
    });
  } catch (error) {
    console.error(`Error scanning directory: ${dir}`, error);
  }
}

// Start scanning
scanDirectory(COMPONENTS_DIR);
console.log('\nAnalysis complete!');

// Generate a report of directory structure
console.log('\nGenerating current directory structure report...');

const structure = {};

function buildStructure(dir, obj) {
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const itemPath = path.join(dir, item);
    const stats = fs.statSync(itemPath);
    
    if (stats.isDirectory()) {
      obj[item] = {};
      buildStructure(itemPath, obj[item]);
    } else {
      if (!obj.files) {
        obj.files = [];
      }
      obj.files.push(item);
    }
  });
}

buildStructure(COMPONENTS_DIR, structure);

// Write structure to a report file
const reportPath = path.join(__dirname, '../component-structure-report.json');
fs.writeFileSync(reportPath, JSON.stringify(structure, null, 2));
console.log(`Directory structure report written to: ${reportPath}`);

// Proposed structure
console.log('\nProposed directory structure:');
console.log(`
src/components/
├── common/                 # Reusable UI components
│   ├── button/
│   │   ├── Button.tsx
│   │   ├── ButtonGroup.tsx
│   │   └── index.ts
│   ├── card/
│   │   ├── Card.tsx
│   │   └── index.ts
│   └── ...
├── layout/                 # Structural components
│   ├── dashboard-layout/
│   │   ├── DashboardLayout.tsx
│   │   └── index.ts
│   ├── header/
│   │   ├── Header.tsx
│   │   └── index.ts
│   └── ...
├── features/               # Feature-specific components
│   ├── plaid/
│   │   ├── PlaidLink.tsx
│   │   └── index.ts
│   ├── budget/
│   │   ├── BudgetSummary.tsx
│   │   └── index.ts
│   └── ...
└── charts/                 # Data visualization components
    ├── line-chart/
    │   ├── LineChart.tsx
    │   └── index.ts
    └── ...
`);

// Provide instructions for next steps
console.log('\nNext steps:');
console.log('1. Review the component-structure-report.json file');
console.log('2. Create a transformation plan for each component');
console.log('3. Run the fix-component-structure.sh script (after reviewing & creating it)');
console.log('4. Update imports using update-imports.js (after reviewing & creating it)');
console.log('\nSee the plan document for more detailed instructions.'); 