/**
 * Case Sensitivity Bridge Creator
 * 
 * This script helps create "bridge" files that solve case sensitivity issues
 * between Windows development and Linux deployments
 * 
 * Usage: 
 * node create-component-bridge.js ComponentName [SubDirectory] [Extension]
 * 
 * Example:
 * node create-component-bridge.js Login auth tsx
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the component name and optional subdirectory from command line arguments
const componentName = process.argv[2];
const subDirectory = process.argv[3] || '';
const fileExtension = process.argv[4] || 'tsx'; // Default to tsx

if (!componentName) {
  console.error('Please provide a component name!');
  console.log('Usage: node create-component-bridge.js ComponentName [SubDirectory] [Extension]');
  process.exit(1);
}

// Create the bridge file in lower-components
const bridgeDir = path.join(__dirname, 'src', 'lower-components');
const bridgeFile = path.join(bridgeDir, `${componentName}.js`);

// Create the directory if it doesn't exist
if (!fs.existsSync(bridgeDir)) {
  fs.mkdirSync(bridgeDir, { recursive: true });
  console.log(`Created directory: ${bridgeDir}`);
}

// Determine the correct import path based on subdirectory
const importPath = subDirectory 
  ? `../components/${subDirectory}/${componentName}.${fileExtension}`
  : `../components/${componentName}.${fileExtension}`;

// Content for the bridge file
const bridgeContent = `// Case sensitivity bridge for ${componentName}
// Generated by create-component-bridge.js
export { ${componentName} } from '${importPath}';
`;

// Write the bridge file
fs.writeFileSync(bridgeFile, bridgeContent);
console.log(`Created bridge file: ${bridgeFile}`);

// Now update the index.js file to include this export
const indexFile = path.join(bridgeDir, 'index.js');
let indexContent = '';

if (fs.existsSync(indexFile)) {
  indexContent = fs.readFileSync(indexFile, 'utf8');
  
  // Find where to insert the new export
  const coreComponentsSection = indexContent.indexOf('// Re-export core components');
  if (coreComponentsSection !== -1) {
    const endOfSection = indexContent.indexOf('// Re-export UI components');
    if (endOfSection !== -1) {
      const beforeInsert = indexContent.substring(0, endOfSection).trimEnd();
      const afterInsert = indexContent.substring(endOfSection);
      indexContent = `${beforeInsert}
export { ${componentName} } from './${componentName}.js';

${afterInsert}`;
    }
  } else {
    // If the file doesn't have the expected structure, just append the export
    indexContent += `\nexport { ${componentName} } from './${componentName}.js';\n`;
  }
} else {
  // Create a new index file if it doesn't exist
  indexContent = `// Centralized lowercase re-exports to solve case sensitivity issues
// This file acts as a bridge between case-sensitive environments

// Re-export core components
export { ${componentName} } from './${componentName}.js';

// Re-export UI components 
// (ADD MORE AS NEEDED)

// Re-export feature components
// (ADD MORE AS NEEDED)

// Re-export layout components
// (ADD MORE AS NEEDED)

/**
 * HOW TO USE THIS FILE:
 * 
 * When you encounter a case sensitivity build error like:
 * "Module not found: Error: Can't resolve './components/SomeComponent'"
 * 
 * 1. Create a new file in lower-components/SomeComponent.js that re-exports the component
 * 2. Add the export to this index.js file 
 * 3. Update the import in the original file to use: 
 *    import { SomeComponent } from './lower-components'
 */`;
}

// Write the updated index file
fs.writeFileSync(indexFile, indexContent);
console.log(`Updated index file: ${indexFile}`);

console.log('\nNow update your imports to use:');
console.log(`import { ${componentName} } from './lower-components/index.js';`); 