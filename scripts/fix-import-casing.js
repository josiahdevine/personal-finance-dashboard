/**
 * This script analyzes import statements across the codebase and fixes case sensitivity issues
 * It scans for mismatched casing between import paths and actual filesystem paths
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const COMPONENT_DIRS = ['components', 'Components'];
const FILE_PATTERNS = ['**/*.tsx', '**/*.ts', '**/*.js', '**/*.jsx'];
const EXCLUDE_PATTERNS = ['**/node_modules/**', '**/dist/**', '**/build/**'];

// Track changes for reporting
const changesLog = [];

/**
 * Get the actual filesystem path with correct casing
 * @param {string} importPath - The import path to check
 * @returns {string|null} - The correct path or null if not found
 */
function getActualPath(importPath) {
  // Skip external modules
  if (importPath.startsWith('@') || !importPath.includes('/')) {
    return importPath;
  }

  // Handle relative imports by resolving them from the current file's directory
  const isRelativeImport = importPath.startsWith('./') || importPath.startsWith('../');
  
  // For absolute imports (starting from src/), resolve from the src directory
  // For relative imports, we need the file context to resolve them properly
  let resolvedPath;
  if (!isRelativeImport && importPath.startsWith('src/')) {
    // Remove the src/ prefix for resolving
    resolvedPath = path.join(ROOT_DIR, importPath);
  } else if (!isRelativeImport) {
    // Assume it's from src directory
    resolvedPath = path.join(SRC_DIR, importPath);
  } else {
    // For relative imports, we need the file context which is handled in fixImportsInFile
    return importPath;
  }

  // Check if directory exists
  try {
    const stat = fs.statSync(resolvedPath);
    if (stat.isDirectory()) {
      // Check for index files
      const indexFiles = ['index.ts', 'index.tsx', 'index.js', 'index.jsx'];
      for (const indexFile of indexFiles) {
        const indexPath = path.join(resolvedPath, indexFile);
        if (fs.existsSync(indexPath)) {
          return importPath; // Return the original path as it's valid
        }
      }
    }
  } catch (error) {
    // Path doesn't exist as-is, we'll check for files with extensions
  }

  // Try to find the file with extensions
  const extensions = ['.ts', '.tsx', '.js', '.jsx'];
  for (const ext of extensions) {
    const fullPath = resolvedPath + ext;
    if (fs.existsSync(fullPath)) {
      return importPath; // Return the original path as it's valid
    }
  }

  // If we get here, we couldn't validate the exact path
  // We'll try a case-insensitive search in the fixImportsInFile function
  return importPath;
}

/**
 * Extract import paths from a file
 * @param {string} content - File content
 * @returns {Object[]} - Array of import info objects
 */
function extractImports(content) {
  // Match ES6 imports
  const es6ImportRegex = /import\s+(?:{[^}]*}|\*\s+as\s+[^,]*|[\w$]+)?(?:\s*,\s*(?:{[^}]*}|[\w$]+))?\s+from\s+['"]([^'"]+)['"]/g;
  
  // Match require statements
  const requireRegex = /(?:const|let|var)\s+(?:{[^}]*}|[\w$]+)(?:\s*,\s*(?:{[^}]*}|[\w$]+))?\s*=\s*require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

  const imports = new Set();
  let match;

  // Extract ES6 imports
  while ((match = es6ImportRegex.exec(content)) !== null) {
    imports.add(match[1]);
  }

  // Extract require statements
  while ((match = requireRegex.exec(content)) !== null) {
    imports.add(match[1]);
  }

  return [...imports];
}

/**
 * Fix component imports in a file
 * @param {string} filePath - Path to the file
 * @returns {boolean} - Whether the file was modified
 */
function fixImportsInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const imports = extractImports(content);
    const directory = path.dirname(filePath);
    let updatedContent = content;
    let changesCount = 0;

    for (const importPath of imports) {
      // Skip external modules and absolute paths
      if (!importPath.includes('/') || importPath.startsWith('@') || importPath.startsWith('/')) {
        continue;
      }
      
      // For relative imports, resolve them from the current file's directory
      let resolvedPath;
      if (importPath.startsWith('./') || importPath.startsWith('../')) {
        resolvedPath = path.resolve(directory, importPath);
      } else {
        // For non-relative imports starting with a name, assume they're from src
        resolvedPath = path.join(SRC_DIR, importPath);
      }

      // Check for common extensions
      const extensions = ['.ts', '.tsx', '.js', '.jsx', ''];
      let actualDir = '';
      let actualFile = '';
      let found = false;

      for (const ext of extensions) {
        const testPath = resolvedPath + ext;
        
        try {
          // Check if path exists as-is
          if (fs.existsSync(testPath)) {
            const stat = fs.statSync(testPath);
            
            if (stat.isDirectory()) {
              // If it's a directory, look for index files
              for (const indexExt of ['.ts', '.tsx', '.js', '.jsx']) {
                const indexPath = path.join(testPath, `index${indexExt}`);
                if (fs.existsSync(indexPath)) {
                  found = true;
                  actualDir = testPath;
                  break;
                }
              }
            } else {
              // It's a file
              found = true;
              actualFile = testPath;
            }
            
            break;
          }
        } catch (error) {
          // Path doesn't exist as-is, try case-insensitive search
        }
      }

      if (!found) {
        // Try case-insensitive search
        const components = resolvedPath.split(path.sep);
        let currentPath = components[0] === '' ? '/' : '';
        
        for (let i = 0; i < components.length; i++) {
          const component = components[i];
          if (!component) continue;

          if (i === 0 && component.includes(':')) {
            // Handle Windows drive letters
            currentPath = component + '\\';
            continue;
          }

          if (!fs.existsSync(currentPath)) {
            break;
          }

          try {
            const entries = fs.readdirSync(currentPath);
            const matchingEntry = entries.find(entry => 
              entry.toLowerCase() === component.toLowerCase()
            );

            if (matchingEntry) {
              currentPath = path.join(currentPath, matchingEntry);
            } else {
              // No match found, can't continue
              break;
            }

            // If we've reached the end, check if this is a directory or file
            if (i === components.length - 1) {
              const stat = fs.statSync(currentPath);
              if (stat.isDirectory()) {
                actualDir = currentPath;
              } else {
                actualFile = currentPath;
              }
              found = true;
            }
          } catch (error) {
            // Error reading directory
            break;
          }
        }
      }

      if (found) {
        const correctPath = actualFile || actualDir;
        // Convert the correct path back to a relative import path
        let correctedImportPath;
        
        if (importPath.startsWith('./') || importPath.startsWith('../')) {
          // For relative imports, calculate the new relative path
          correctedImportPath = path.relative(directory, correctPath);
          // Ensure path starts with ./ or ../
          if (!correctedImportPath.startsWith('.')) {
            correctedImportPath = './' + correctedImportPath;
          }
        } else {
          // For imports from src, calculate the path relative to src
          correctedImportPath = path.relative(SRC_DIR, correctPath);
        }
        
        // Replace path separators with forward slashes for JS imports
        correctedImportPath = correctedImportPath.replace(/\\/g, '/');
        
        // Only make changes if the paths are different in casing
        if (correctedImportPath.toLowerCase() === importPath.toLowerCase() && 
            correctedImportPath !== importPath) {
          // Replace the import path in the content, preserving quotes
          const importRegex = new RegExp(`(['"])${importPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(['"])`, 'g');
          updatedContent = updatedContent.replace(importRegex, `$1${correctedImportPath}$2`);
          changesCount++;
          console.log(`Fixed: ${importPath} -> ${correctedImportPath} in ${filePath}`);
        }
      }
    }

    if (changesCount > 0) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`Updated ${changesCount} imports in ${filePath}`);
      return changesCount;
    }
    
    return 0;
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return 0;
  }
}

/**
 * Process all files matching the patterns
 */
function processFiles() {
  const files = glob.sync(`${SRC_DIR}/**/*.{ts,tsx,js,jsx}`, {
    ignore: ['**/node_modules/**', '**/dist/**', '**/build/**']
  });

  let totalChanges = 0;
  let filesChanged = 0;

  for (const file of files) {
    const changes = fixImportsInFile(file);
    if (changes > 0) {
      filesChanged++;
      totalChanges += changes;
    }
  }

  console.log(`
Fixed import casing issues:
- Files processed: ${files.length}
- Files changed: ${filesChanged}
- Total changes: ${totalChanges}
`);
}

// Run the script
processFiles(); 