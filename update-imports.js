const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/App.js',
  'src/App.tsx',
  'src/pages/Dashboard/Overview.js',
  'src/pages/PricingPage.tsx',
  'src/pages/SalaryJournalPage.js',
  'src/pages/TransactionsPage.js',
  'src/pages/LandingPage.js',
  'src/pages/LinkAccountsPage.js',
  'src/pages/GoalsPage.js',
  'src/pages/InvestmentPortfolioPage.tsx',
  'src/pages/Dashboard.js',
  'src/pages/BillsAnalysisPage.js',
  'src/pages/AskAIPage.js',
  'src/pages/AdminDashboard.js',
  'src/mobile/AccountConnectionsMobile.js',
  'src/contexts/AuthContext.js',
  'src/index.js'
];

function updateImports(filePath) {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    const oldContent = content;

    // Update import paths
    content = content.replace(/from ['"]([.\/]*)Components\//g, 'from \'$1components/');

    if (content !== oldContent) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`Updated imports in ${filePath}`);
    } else {
      console.log(`No changes needed in ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
}

function main() {
  filesToUpdate.forEach(updateImports);
  console.log('Import paths update completed!');
}

main(); 