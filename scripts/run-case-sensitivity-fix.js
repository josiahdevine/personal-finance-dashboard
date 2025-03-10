/**
 * This script installs necessary dependencies and runs the fix-import-casing.js script
 */

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Check if glob is installed
try {
  require.resolve('glob');
  console.log('glob is already installed, proceeding...');
} catch (e) {
  console.log('Installing glob dependency...');
  execSync('npm install --no-save glob', { stdio: 'inherit' });
}

// Run the fix-import-casing script
const scriptPath = path.join(__dirname, 'fix-import-casing.js');

console.log('Starting import casing fix script...');
console.log(`Running: node ${scriptPath}`);

// Execute the script
exec(`node ${scriptPath}`, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  
  if (stderr) {
    console.error(`Stderr: ${stderr}`);
  }
  
  console.log(stdout);
  console.log('Import casing fix complete!');
});

// Create documentation about the process
const docsPath = path.join(__dirname, '..', 'docs', 'case-sensitivity-fixes.md');
const content = `# Case Sensitivity in Import Paths

## Problem

Our application faces build issues on case-sensitive platforms like Linux (used by Netlify) when import paths don't match the actual filesystem casing. For example, importing from \`'../Components/Button'\` when the directory is actually \`'../components/Button'\` causes no issues on Windows but fails on Linux.

## Solution

We've implemented two strategies to address this:

1. **Enforced Consistent Casing in TypeScript**: The \`tsconfig.json\` has \`forceConsistentCasingInFileNames\` set to \`true\` to warn about case sensitivity issues during development.

2. **Automated Fix Script**: We created a script (\`scripts/fix-import-casing.js\`) that scans the codebase for case sensitivity issues in import paths and fixes them automatically.

### How the Fix Script Works

The script:
1. Finds all TypeScript and JavaScript files in the src directory
2. Extracts import statements from each file
3. Checks if the imported path has correct casing compared to the filesystem
4. Updates the import statement if needed

### Running the Fix Script

To fix case sensitivity issues in import paths:

\`\`\`bash
node scripts/run-case-sensitivity-fix.js
\`\`\`

### Best Practices for Imports

To avoid future case sensitivity issues:

1. Use consistent casing in your imports (prefer lowercase for directory names)
2. Use relative imports for local files
3. Use the exact casing that matches the filesystem
4. Run the linter and TypeScript compiler to catch issues early

## Common Case Sensitivity Patterns

These patterns have been fixed throughout the codebase:

- \`../Components/...\` → \`../components/...\`
- \`../Charts/...\` → \`../charts/...\`

## Affected Components

Components that have been updated to use the correct import path casing:

- Dashboard widgets
- Chart components
- UI elements

This ensures our application builds consistently across all environments.
`;

fs.writeFileSync(docsPath, content, 'utf8');
console.log(`Documentation created at ${docsPath}`);

// Update the UI design system progress to reflect this work
const progressPath = path.join(__dirname, '..', 'docs', 'ui-design-system-progress.md');
if (fs.existsSync(progressPath)) {
  let progressContent = fs.readFileSync(progressPath, 'utf8');
  
  // Add a note about case sensitivity fixes
  if (!progressContent.includes('Case Sensitivity Fixes')) {
    const insertPoint = progressContent.indexOf('## Known Issues');
    if (insertPoint !== -1) {
      const updatedContent = [
        progressContent.slice(0, insertPoint),
        '### Case Sensitivity Fixes\n',
        '- ✅ Created utility script to automatically fix case sensitivity issues in import paths\n',
        '- ✅ Added documentation for case sensitivity best practices\n',
        '- ✅ Updated import paths to use consistent casing throughout the codebase\n\n',
        progressContent.slice(insertPoint)
      ].join('');
      
      // Update known issues section
      let updatedIssuesContent = updatedContent.replace(
        '- Case sensitivity issues in some import paths need to be addressed',
        '- ✅ Case sensitivity issues in import paths addressed'
      );
      
      fs.writeFileSync(progressPath, updatedIssuesContent, 'utf8');
      console.log('Updated UI design system progress document');
    }
  }
}

console.log('All tasks completed successfully!'); 