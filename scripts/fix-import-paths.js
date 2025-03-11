import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Mapping of old paths to new paths
const pathMapping = {
  // Dashboard components
  './components/Dashboard/Overview': './components/features/dashboard/Overview',
  './components/Dashboard/SalaryJournal': './components/features/dashboard/SalaryJournal',
  './components/Dashboard/BudgetPlanning': './components/features/dashboard/BudgetPlanning',
  './components/Dashboard/Analytics': './components/features/dashboard/Analytics',
  './components/Dashboard/Notifications': './components/features/dashboard/Notifications', 
  './components/Dashboard/AskAI': './components/features/dashboard/AskAI',
  './components/Dashboard/Settings': './components/features/dashboard/Settings',
  
  // Landing components
  './Landing/Testimonials': '../features/landing/Testimonials',
  './Landing/IntegrationLogos': '../features/landing/IntegrationLogos',
  './Landing/DemoVideo': '../features/landing/DemoVideo',
  './Landing/UnifiedDemo': '../features/landing/UnifiedDemo',
  
  // Common components new paths
  '../../../components/Charts/PieChart': '../../../components/common/charts/PieChart',
  '../../../components/Charts/LineChart': '../../../components/common/charts/LineChart',
  '../../../components/common/Widget': '../../../components/common/widget/Widget',
  '../../../components/common/Card': '../../../components/common/card/Card',
  '../../../components/common/Button': '../../../components/common/button/Button',
  '../../common/Card': '../../common/card/Card',
  '../../common/Button': '../../common/button/Button',
  '../../common/DataTable': '../../common/data-table/DataTable',
  '../../common/Badge': '../../common/badge/Badge',
  
  // Other paths
  './Footer': '../Footer',
  '../context/ThemeContext': '../contexts/ThemeContext',
  '../utils/logger': '../utils/logger.js',
  '../../components/Bills/BillForm': '../../components/features/bills/BillForm',
  
  // Common component paths for pages
  '../components/common/Card': '../components/common/card/Card',
  '../components/common/StatCard': '../components/common/stat-card/StatCard',
  '../components/common/DataTable': '../components/common/data-table/DataTable',
  '../components/common/Button': '../components/common/button/Button',
  '../components/common/Text': '../components/common/text/Text',
  '../components/common/Heading': '../components/common/heading/Heading',
  
  // Cash flow component
  '../components/features/cashFlow/CashFlowDashboard': '../components/features/cash-flow/CashFlowDashboard'
};

// Find all TypeScript and JavaScript files
const findFiles = async () => {
  const files = await glob('src/**/*.{ts,tsx,js,jsx}', { cwd: rootDir });
  return files.map(file => path.join(rootDir, file));
};

// Process a file to update imports
const processFile = (filePath) => {
  try {
    console.log(`Processing ${filePath}`);
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Check for imports that need to be updated
    for (const [oldPath, newPath] of Object.entries(pathMapping)) {
      const importRegex = new RegExp(`import\\s+(.+?)\\s+from\\s+['"]${oldPath.replace(/\//g, '\\/').replace(/\./g, '\\.')}['"]`, 'g');
      if (importRegex.test(content)) {
        content = content.replace(importRegex, `import $1 from '${newPath}'`);
        modified = true;
        console.log(`  - Updated import from ${oldPath} to ${newPath}`);
      }
    }

    // Fix logger import specifically
    const loggerImportRegex = /import\s+\{\s*logger\s*\}\s+from\s+['"](.+?)utils\/logger['"]/g;
    if (loggerImportRegex.test(content)) {
      content = content.replace(loggerImportRegex, `import logger from '$1utils/logger.js'`);
      modified = true;
      console.log(`  - Updated logger import to use default export`);
    }

    // Save changes if file was modified
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  - Saved changes to ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
};

// Main function
const main = async () => {
  try {
    const files = await findFiles();
    console.log(`Found ${files.length} files to check`);
    
    let updatedFilesCount = 0;
    for (const file of files) {
      const wasUpdated = processFile(file);
      if (wasUpdated) updatedFilesCount++;
    }
    
    console.log(`\nUpdated imports in ${updatedFilesCount} files`);
    
    if (updatedFilesCount > 0) {
      console.log(`\nNOTE: Some components may still need to be created in their new locations.`);
      console.log(`Make sure all the required components exist in the new directory structure.`);
    }
  } catch (error) {
    console.error('Error running the script:', error);
    process.exit(1);
  }
};

// Run the script
main(); 