import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Dashboard feature components we need to create
const dashboardComponents = [
  'Overview',
  'SalaryJournal',
  'BudgetPlanning',
  'Analytics',
  'Notifications',
  'AskAI',
  'Settings'
];

// Landing feature components we need to create
const landingComponents = [
  'Testimonials',
  'IntegrationLogos',
  'DemoVideo',
  'UnifiedDemo'
];

// Common components we need to create
const commonComponents = [
  'charts/PieChart',
  'charts/LineChart',
  'card/Card',
  'button/Button',
  'data-table/DataTable',
  'badge/Badge',
  'stat-card/StatCard',
  'text/Text',
  'heading/Heading',
  'widget/Widget'
];

// Function to create directory if it doesn't exist
const ensureDirectoryExists = (dir) => {
  if (!fs.existsSync(dir)) {
    console.log(`Creating directory: ${dir}`);
    // Recursively create parent directories if needed
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Function to create a basic React component
const createBasicComponent = (componentPath, componentName) => {
  const componentDir = path.dirname(componentPath);
  ensureDirectoryExists(componentDir);

  const componentContent = `import React from 'react';

const ${componentName} = () => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">${componentName}</h2>
      <p>This is a placeholder component for ${componentName}.</p>
    </div>
  );
};

export default ${componentName};
`;

  const indexContent = `export { default } from './${componentName}';
`;

  // Create the component file
  const componentFilePath = path.join(componentPath);
  if (!fs.existsSync(componentFilePath)) {
    console.log(`Creating component: ${componentFilePath}`);
    fs.writeFileSync(componentFilePath, componentContent);
  } else {
    console.log(`Component already exists: ${componentFilePath}`);
  }

  // Create an index.tsx file for easier imports
  const indexPath = path.join(componentDir, 'index.tsx');
  if (!fs.existsSync(indexPath)) {
    console.log(`Creating index: ${indexPath}`);
    fs.writeFileSync(indexPath, indexContent);
  } else {
    console.log(`Index already exists: ${indexPath}`);
  }
};

// Create dashboard feature components
dashboardComponents.forEach(component => {
  const componentDir = path.join(rootDir, 'src', 'components', 'features', 'dashboard', component);
  ensureDirectoryExists(componentDir);
  createBasicComponent(
    path.join(componentDir, `${component}.tsx`),
    component
  );
});

// Create landing feature components
landingComponents.forEach(component => {
  const componentDir = path.join(rootDir, 'src', 'components', 'features', 'landing');
  ensureDirectoryExists(componentDir);
  createBasicComponent(
    path.join(componentDir, `${component}.tsx`),
    component
  );
});

// Create common components
commonComponents.forEach(componentPath => {
  const parts = componentPath.split('/');
  const componentName = parts[parts.length - 1];
  const componentDir = path.join(rootDir, 'src', 'components', 'common', ...parts.slice(0, parts.length - 1));
  ensureDirectoryExists(componentDir);
  createBasicComponent(
    path.join(componentDir, `${componentName}.tsx`),
    componentName
  );
});

// Create Bills feature directory and components
const billsDir = path.join(rootDir, 'src', 'components', 'features', 'bills');
ensureDirectoryExists(billsDir);
createBasicComponent(
  path.join(billsDir, 'BillForm.tsx'),
  'BillForm'
);

// Create cash flow feature directory and components
const cashFlowDir = path.join(rootDir, 'src', 'components', 'features', 'cash-flow');
ensureDirectoryExists(cashFlowDir);
createBasicComponent(
  path.join(cashFlowDir, 'CashFlowDashboard.tsx'),
  'CashFlowDashboard'
);

console.log('\nComponent generation complete!');
console.log('These are placeholder components that should be replaced with proper implementations.\n'); 