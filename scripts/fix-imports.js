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