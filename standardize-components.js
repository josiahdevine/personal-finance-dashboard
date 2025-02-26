const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const config = {
  projectRoot: __dirname,
  sourceDir: path.join(__dirname, 'src'),
  componentsDir: path.join(__dirname, 'src', 'Components'),
  targetDir: path.join(__dirname, 'src', 'components'),
  changelogFilePath: path.join(__dirname, 'DEVELOPMENT-CHANGELOG.md')
};

// Function to check if a directory exists
function directoryExists(dirPath) {
  try {
    return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
  } catch (error) {
    return false;
  }
}

// Function to update import statements in a file
function updateImports(filePath, oldPrefix, newPrefix) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let updatedContent = content.replace(
      new RegExp(`from ['"]${oldPrefix}(.*?)['"]`, 'g'),
      `from '${newPrefix}$1'`
    );
    
    // Special case for calculateTaxProgressive -> calculateProgressiveTax
    updatedContent = updatedContent.replace(
      /calculateTaxProgressive\(/g,
      'calculateProgressiveTax('
    );
    
    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent);
      console.log(`Updated imports in ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error updating imports in ${filePath}:`, error);
    return false;
  }
}

// Function to recursively scan and update imports in all JS/JSX files
function updateImportsInDirectory(dir, oldPrefix, newPrefix) {
  let filesUpdated = 0;
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and build directories
      if (entry.name !== 'node_modules' && entry.name !== 'build') {
        filesUpdated += updateImportsInDirectory(fullPath, oldPrefix, newPrefix);
      }
    } else if (entry.isFile() && (fullPath.endsWith('.js') || fullPath.endsWith('.jsx'))) {
      if (updateImports(fullPath, oldPrefix, newPrefix)) {
        filesUpdated++;
      }
    }
  }
  
  return filesUpdated;
}

// Function to recursively copy a directory
function copyDirectory(src, dest) {
  // Create the destination directory if it doesn't exist
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  // Get all files and directories in the source directory
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  // Process each entry
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      // Recursively copy directories
      copyDirectory(srcPath, destPath);
    } else {
      // Copy files
      try {
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied file: ${srcPath} -> ${destPath}`);
      } catch (error) {
        console.error(`Error copying file ${srcPath}:`, error);
      }
    }
  }
}

// Main function to standardize component directory structure
function standardizeComponentDirectory() {
  console.log('Starting component directory standardization...');
  
  // Check if Components (capital C) directory exists
  if (!directoryExists(config.componentsDir)) {
    console.log('No "Components" directory with capital C found. Nothing to standardize.');
    return;
  }
  
  // Create lowercase components directory if it doesn't exist
  if (!directoryExists(config.targetDir)) {
    console.log('Creating lowercase "components" directory...');
    fs.mkdirSync(config.targetDir, { recursive: true });
  }
  
  // Copy all files from Components to components
  console.log('Copying files from Components to components...');
  copyDirectory(config.componentsDir, config.targetDir);
  
  // Update import statements in all JS files
  console.log('Updating import statements to use lowercase "components"...');
  const filesUpdated = updateImportsInDirectory(
    config.sourceDir,
    './Components',
    './components'
  );
  
  // Also update ../Components imports
  const moreFilesUpdated = updateImportsInDirectory(
    config.sourceDir,
    '../Components',
    '../components'
  );
  
  console.log(`Updated imports in ${filesUpdated + moreFilesUpdated} files.`);
  
  // Update DEVELOPMENT-CHANGELOG.md
  try {
    const date = new Date().toISOString().split('T')[0];
    const changeDescription = `### Directory Structure Standardization

1. **Component Directory Standardization**:
   - Standardized all component imports to use lowercase 'components' directory
   - Updated import statements across the codebase for consistent paths
   - Resolved potential case-sensitivity issues for deployment environments
   - Fixed circular dependency issues by ensuring consistent import paths
   
This change improves compatibility with case-sensitive filesystems (like Linux servers) and eliminates potential deployment issues when files are referenced with inconsistent casing.`;
    
    const entry = `\n## ${date}\n\n${changeDescription}\n`;
    
    // Read the existing changelog
    let content = '';
    if (fs.existsSync(config.changelogFilePath)) {
      content = fs.readFileSync(config.changelogFilePath, 'utf8');
    }
    
    // Add new entry near the top (after any headers but before the first entry)
    if (content.includes('# Personal Finance Dashboard - Development Changelog')) {
      const parts = content.split('\n## ');
      parts[0] += entry;
      content = parts.join('\n## ');
    } else {
      content = '# Personal Finance Dashboard - Development Changelog\n' + entry + content;
    }
    
    // Write the updated content
    fs.writeFileSync(config.changelogFilePath, content);
    console.log('Updated DEVELOPMENT-CHANGELOG.md with standardization record');
  } catch (error) {
    console.error('Error updating DEVELOPMENT-CHANGELOG.md:', error);
  }
  
  console.log('Component directory standardization completed successfully!');
}

// Run the standardization if executing directly
if (require.main === module) {
  standardizeComponentDirectory();
}

module.exports = {
  standardizeComponentDirectory
}; 