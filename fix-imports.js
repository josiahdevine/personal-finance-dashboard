const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  projectRoot: __dirname,
  sourceDir: path.join(__dirname, 'src'),
  appJsPath: path.join(__dirname, 'src', 'App.js'),
  contextDir: path.join(__dirname, 'src', 'contexts'),
  pagesDir: path.join(__dirname, 'src', 'pages'),
  indexJsPath: path.join(__dirname, 'src', 'index.js')
};

// Function to fix imports in a file
function fixImports(filePath) {
  console.log(`Fixing imports in ${filePath}...`);
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix import paths
    let updated = content;
    
    // First, fix any direct component imports
    updated = updated.replace(
      /from ['"]\.\/components\/([^'"/]+)['"]/g,
      (match, componentName) => {
        console.log(`Found component import: ${componentName}`);
        return `from './Components/${componentName}'`;
      }
    );
    
    // Fix imports from components directory to other components
    updated = updated.replace(
      /from ['"]\.\.\/components\/([^'"/]+)['"]/g,
      (match, componentName) => {
        console.log(`Found relative component import: ${componentName}`);
        return `from '../Components/${componentName}'`;
      }
    );
    
    // Fix auth component imports specifically
    updated = updated.replace(
      /from ['"]\.\/components\/auth\/([^'"/]+)['"]/g,
      (match, componentName) => {
        console.log(`Found auth component import: ${componentName}`);
        return `from './Components/auth/${componentName}'`;
      }
    );
    
    // Fix auth component imports with relative paths
    updated = updated.replace(
      /from ['"]\.\.\/components\/auth\/([^'"/]+)['"]/g,
      (match, componentName) => {
        console.log(`Found relative auth component import: ${componentName}`);
        return `from '../Components/auth/${componentName}'`;
      }
    );
    
    // Fix ui component imports
    updated = updated.replace(
      /from ['"]\.\/components\/ui\/([^'"/]+)['"]/g,
      (match, componentName) => {
        console.log(`Found ui component import: ${componentName}`);
        return `from './Components/ui/${componentName}'`;
      }
    );
    
    // If changes were made, write the file
    if (content !== updated) {
      fs.writeFileSync(filePath, updated);
      console.log(`✓ Updated imports in ${filePath}`);
      return true;
    } else {
      console.log(`No changes needed for ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`Error fixing imports in ${filePath}:`, error);
    return false;
  }
}

// Function to process specific files
function processFiles() {
  console.log('Starting to fix imports in critical files...');
  
  // Fix App.js
  fixImports(config.appJsPath);
  
  // Fix index.js
  fixImports(config.indexJsPath);
  
  // Fix context files
  const contextFiles = fs.readdirSync(config.contextDir, { withFileTypes: true })
    .filter(entry => entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.jsx')))
    .map(entry => path.join(config.contextDir, entry.name));
  
  for (const filePath of contextFiles) {
    fixImports(filePath);
  }
  
  // Fix page files
  const pageFiles = fs.readdirSync(config.pagesDir, { withFileTypes: true })
    .filter(entry => entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.jsx')))
    .map(entry => path.join(config.pagesDir, entry.name));
  
  for (const filePath of pageFiles) {
    fixImports(filePath);
  }
  
  console.log('Import fixing process completed!');
}

// Run if called directly
if (require.main === module) {
  processFiles();
}

module.exports = {
  processFiles,
  fixImports
}; 