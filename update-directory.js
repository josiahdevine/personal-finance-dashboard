const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const { execSync } = require('child_process');

// Configuration
const config = {
  projectRoot: __dirname,
  mdFilePath: path.join(__dirname, 'DEVELOPMENT-NEXT-STEPS.md'),
  ignoreDirs: [
    'node_modules', 
    '.git', 
    'build', 
    'dist',
    'coverage',
    '.netlify',
    'functions/node_modules'
  ],
  ignoreFiles: [
    '.DS_Store',
    'thumbs.db',
    '.env',
    '.env.local'
  ],
  changelogFilePath: path.join(__dirname, 'DEVELOPMENT-CHANGELOG.md')
};

// Function to get a directory structure as a nested object
function getDirStructure(dir, level = 0, maxLevel = 3, ignoreList = config.ignoreDirs) {
  if (level > maxLevel) return '[Depth limit reached]';
  
  try {
    const result = {};
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      if (ignoreList.includes(item)) continue;
      
      const itemPath = path.join(dir, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        result[item + '/'] = getDirStructure(itemPath, level + 1, maxLevel, ignoreList);
      } else if (!config.ignoreFiles.some(ignorePattern => item.includes(ignorePattern))) {
        result[item] = stats.size;
      }
    }
    
    return result;
  } catch (error) {
    console.error(`Error processing directory ${dir}:`, error);
    return '[Error]';
  }
}

// Generate a readable tree representation of the directory structure
function generateDirectoryTree(structure, prefix = '', isLast = true) {
  const entries = Object.entries(structure);
  let result = '';
  
  for (let i = 0; i < entries.length; i++) {
    const [key, value] = entries[i];
    const isLastItem = i === entries.length - 1;
    const connector = isLast ? '└── ' : '├── ';
    const childPrefix = isLast ? '    ' : '│   ';
    
    result += prefix + connector + key + '\n';
    
    if (typeof value === 'object') {
      result += generateDirectoryTree(value, prefix + childPrefix, isLastItem);
    }
  }
  
  return result;
}

// Update the DEVELOPMENT-NEXT-STEPS.md file with the latest directory structure
function updateDevelopmentNextSteps() {
  try {
    // Get the current structure
    const structure = getDirStructure(config.projectRoot);
    const treeOutput = generateDirectoryTree(structure);
    
    // Read the existing file
    let content = '';
    if (fs.existsSync(config.mdFilePath)) {
      content = fs.readFileSync(config.mdFilePath, 'utf8');
    }
    
    // Update or add the directory structure section
    const directorySection = '## Current Project Structure\n\n```\n' + treeOutput + '```\n';
    
    if (content.includes('## Current Project Structure')) {
      // Replace existing section
      content = content.replace(
        /## Current Project Structure\n\n```[\s\S]*?```\n/,
        directorySection
      );
    } else {
      // Add new section at the end
      content += '\n' + directorySection;
    }
    
    // Write the updated content
    fs.writeFileSync(config.mdFilePath, content);
    console.log('Updated DEVELOPMENT-NEXT-STEPS.md with latest directory structure');
  } catch (error) {
    console.error('Error updating DEVELOPMENT-NEXT-STEPS.md:', error);
  }
}

// Track recent changes for changelog updates
const recentChanges = [];

// Watch for file changes
function watchForChanges() {
  console.log('Starting file watcher...');
  
  const watcher = chokidar.watch('.', {
    ignored: [
      /(^|[\/\\])\../, // Ignore dotfiles
      /node_modules/,
      /build/,
      /.git/,
      /.netlify/,
      /functions\/node_modules/
    ],
    persistent: true
  });
  
  // Add change event listeners
  watcher
    .on('add', path => {
      console.log(`File ${path} has been added`);
      recentChanges.push({ type: 'add', path, timestamp: new Date() });
      updateDevelopmentNextSteps();
    })
    .on('change', path => {
      console.log(`File ${path} has been changed`);
      recentChanges.push({ type: 'change', path, timestamp: new Date() });
    })
    .on('unlink', path => {
      console.log(`File ${path} has been removed`);
      recentChanges.push({ type: 'remove', path, timestamp: new Date() });
      updateDevelopmentNextSteps();
    });
    
  // Initial update
  updateDevelopmentNextSteps();
  
  console.log('Watcher initialized. Press Ctrl+C to stop.');
}

// Update changelog with recent changes
function updateChangelog(changeDescription) {
  try {
    const date = new Date().toISOString().split('T')[0];
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
    console.log('Updated DEVELOPMENT-CHANGELOG.md with new changes');
  } catch (error) {
    console.error('Error updating DEVELOPMENT-CHANGELOG.md:', error);
  }
}

// Manual update for when changes are made
function recordChanges(description) {
  updateChangelog(description);
  // Update NEXT_STEPS.md as well after logging changes
  updateDevelopmentNextSteps();
}

// Run on command
if (process.argv[2] === 'watch') {
  watchForChanges();
} else if (process.argv[2] === 'update') {
  updateDevelopmentNextSteps();
  console.log('Directory structure updated');
} else if (process.argv[2] === 'record' && process.argv[3]) {
  recordChanges(process.argv[3]);
  console.log('Changes recorded to changelog');
} else {
  console.log(`
Usage:
  node update-directory.js watch   - Start watching for file changes
  node update-directory.js update  - Update directory structure once
  node update-directory.js record "Description of changes" - Record changes to changelog
  `);
}

module.exports = {
  updateDevelopmentNextSteps,
  recordChanges
}; 