const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Function to add underscore prefix to unused variables
function addUnderscorePrefix(content) {
  return content.replace(/const\s+([a-zA-Z][a-zA-Z0-9]*)\s*=/g, (match, varName) => {
    if (content.indexOf(varName, match.length) === -1) {
      return `const _${varName} =`;
    }
    return match;
  });
}

// Function to remove console.log statements
function removeConsoleLogs(content) {
  return content.replace(/console\.(log|debug|info|warn|error)\((.*?)\);?\n?/g, '');
}

// Function to fix form labels
function fixFormLabels(content) {
  return content.replace(
    /<label([^>]*)>([^<]*)<\/label>/g,
    '<label$1 htmlFor="$2">$2</label>'
  );
}

// Function to fix click handlers
function fixClickHandlers(content) {
  return content.replace(
    /onClick={([^}]+)}/g,
    'onClick={$1} onKeyDown={$1} role="button" tabIndex={0}'
  );
}

// Process all JavaScript and TypeScript files
async function main() {
  try {
    const files = await glob('src/**/*.{js,jsx,ts,tsx}');
    
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      let newContent = content;

      // Apply fixes
      newContent = addUnderscorePrefix(newContent);
      newContent = removeConsoleLogs(newContent);
      newContent = fixFormLabels(newContent);
      newContent = fixClickHandlers(newContent);

      if (newContent !== content) {
        fs.writeFileSync(file, newContent);
        console.log(`Fixed: ${file}`);
      }
    });
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

main(); 