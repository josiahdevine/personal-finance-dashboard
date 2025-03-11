const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Function to update imports in files
function updateImports(files) {
  let updatedCount = 0;

  files.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      
      // Replace imports from Card/Card to just Card
      let updatedContent = content.replace(
        /import\s+Card\s+from\s+(['"])(.*)\/common\/Card\/Card(['"])/g,
        'import Card from $1$2/common/Card$3'
      );
      
      // Also handle lowercase 'card' directories
      updatedContent = updatedContent.replace(
        /import\s+Card\s+from\s+(['"])(.*)\/common\/card\/Card(['"])/g,
        'import Card from $1$2/common/Card$3'
      );
      
      // Only write back if changes were made
      if (content !== updatedContent) {
        fs.writeFileSync(file, updatedContent, 'utf8');
        console.log(`Updated: ${file}`);
        updatedCount++;
      }
    } catch (err) {
      console.error(`Error processing ${file}:`, err);
    }
  });

  return updatedCount;
}

// Find all TypeScript and JavaScript files
const files = glob.sync('../src/**/*.{ts,tsx,js,jsx}');
const updatedCount = updateImports(files);

console.log(`\nTotal files updated: ${updatedCount}`); 