/**
 * Script to identify deprecated components in the codebase
 * This helps in tracking what needs to be replaced and removed
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('Scanning codebase for deprecated components...');

// Find files with deprecated markers
const deprecatedFiles = glob.sync('src/**/*.{ts,tsx,js,jsx}', { ignore: '**/node_modules/**' })
  .filter(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      return content.includes('@deprecated') || 
             content.includes('// deprecated') || 
             content.includes('/* deprecated */');
    } catch (error) {
      console.error(`Error reading file: ${file}`, error);
      return false;
    }
  });

console.log(`\nFound ${deprecatedFiles.length} deprecated components:`);
deprecatedFiles.forEach(file => {
  console.log(`- ${file}`);
});

// Find imports of deprecated components
const allDeprecatedImports = new Map();

deprecatedFiles.forEach(file => {
  const baseName = path.basename(file, path.extname(file));
  const relativePath = path.relative(path.join(__dirname, '..'), path.dirname(file));
  
  // Look for imports in all files
  const importingFiles = glob.sync('src/**/*.{ts,tsx,js,jsx}', { ignore: '**/node_modules/**' })
    .filter(importFile => {
      if (importFile === file) return false;
      
      try {
        const content = fs.readFileSync(importFile, 'utf8');
        return content.includes(`import ${baseName}`) || 
               content.includes(`from '${relativePath}/${baseName}'`) ||
               content.includes(`from "${relativePath}/${baseName}"`);
      } catch (error) {
        console.error(`Error reading file: ${importFile}`, error);
        return false;
      }
    });
  
  if (importingFiles.length > 0) {
    allDeprecatedImports.set(file, importingFiles);
    
    console.log(`\nFiles importing deprecated component ${file}:`);
    importingFiles.forEach(importingFile => {
      console.log(`  - ${importingFile}`);
    });
  }
});

// Generate a summary table
console.log('\nSummary:');
console.log(`Total deprecated components: ${deprecatedFiles.length}`);
console.log(`Components with imports to fix: ${allDeprecatedImports.size}`);

// Export findings to a report file
const report = {
  timestamp: new Date().toISOString(),
  deprecatedFiles,
  componentsWithImports: Object.fromEntries(
    Array.from(allDeprecatedImports.entries()).map(([key, value]) => [key, value])
  ),
  summary: {
    totalDeprecated: deprecatedFiles.length,
    componentsToFix: allDeprecatedImports.size
  }
};

const reportPath = path.join(__dirname, '../deprecation-report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`Report written to: ${reportPath}`);

// Check for files with recommended replacements
console.log('\nChecking for recommended replacements...');
const filesWithRecommendations = deprecatedFiles.filter(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    return content.includes('Please use') || 
           content.includes('Use instead') || 
           content.includes('replacement') ||
           content.includes('replaced by');
  } catch (error) {
    return false;
  }
});

if (filesWithRecommendations.length > 0) {
  console.log(`\nFiles with replacement recommendations:`);
  filesWithRecommendations.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      const deprecationLine = lines.find(line => 
        line.includes('@deprecated') || 
        line.includes('// deprecated') || 
        line.includes('/* deprecated */')
      );
      
      if (deprecationLine) {
        console.log(`- ${file}`);
        console.log(`  ${deprecationLine.trim()}`);
      }
    } catch (error) {
      // Skip if can't read file
    }
  });
}

// Check for files without imports (can be safely removed)
const filesWithoutImports = deprecatedFiles.filter(file => 
  !allDeprecatedImports.has(file)
);

if (filesWithoutImports.length > 0) {
  console.log(`\nDeprecated files without imports (can be safely removed):`);
  filesWithoutImports.forEach(file => {
    console.log(`- ${file}`);
  });
}

console.log('\nDeprecation analysis complete!'); 