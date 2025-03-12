#!/usr/bin/env node
/**
 * This script installs all the necessary dependencies for testing the UI components
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Define the packages to install
const devDependencies: string[] = [
  '@testing-library/react',
  '@testing-library/user-event',
  '@testing-library/jest-dom',
  'jest',
  'jest-environment-jsdom',
  'ts-jest',
  '@types/jest',
  'axe-core',
  '@axe-core/react',
  '@storybook/react',
  '@storybook/addon-essentials',
  '@storybook/addon-interactions',
  '@storybook/addon-links',
  '@storybook/addon-a11y',
  '@storybook/builder-webpack5',
  '@storybook/testing-library'
];

// Define directories to create
const directories: string[] = [
  'src/components/ui/__tests__',
  'src/test-utils',
  'src/stories'
];

// Create test setup file
const setupFile = `
// jest-dom adds custom jest matchers for asserting on DOM nodes.
import '@testing-library/jest-dom';
`;

// Create test utils file
const testUtilsFile = `
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';

// Add any providers that components need here
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {children}
    </>
  );
};

type CustomRenderOptions = {
  wrapperProps?: Record<string, unknown>;
} & Omit<RenderOptions, 'wrapper'>;

const customRender = (
  ui: ReactElement,
  options?: CustomRenderOptions
): ReturnType<typeof render> => render(ui, { wrapper: AllTheProviders, ...options });

// re-export everything
export * from '@testing-library/react';

// override render method
export { customRender as render };
`;

// Jest config file
const jestConfig = `
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
  ],
  transform: {
    '^.+\\\\.(ts|tsx)$': 'ts-jest',
  },
};
`;

// Storybook main.js
const storybookMain = `
module.exports = {
  "stories": [
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-a11y"
  ],
  "framework": "@storybook/react",
  "core": {
    "builder": "@storybook/builder-webpack5"
  }
}
`;

// Storybook preview.js
const storybookPreview = `
import '../src/index.css';

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  a11y: {
    // accessibility options
    element: '#root',
    manual: false,
  },
}
`;

// Sample EnhancedSelect story
const enhancedSelectStory = `
import React, { useState } from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { EnhancedSelect } from '../components/ui/enhanced-select';

export default {
  title: 'Components/EnhancedSelect',
  component: EnhancedSelect,
  argTypes: {
    value: { control: 'text' },
    onChange: { action: 'changed' },
    options: { control: 'object' },
    className: { control: 'text' },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
  },
} as ComponentMeta<typeof EnhancedSelect>;

const Template: ComponentStory<typeof EnhancedSelect> = (args) => {
  const [value, setValue] = useState(args.value);
  
  const handleChange = (e: any) => {
    setValue(e.target.value);
    args.onChange?.(e);
  };
  
  return <EnhancedSelect {...args} value={value} onChange={handleChange} />;
};

export const Default = Template.bind({});
Default.args = {
  value: '',
  options: [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ],
  placeholder: 'Select an option',
};

export const WithValue = Template.bind({});
WithValue.args = {
  value: 'option2',
  options: [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ],
  placeholder: 'Select an option',
};

export const Disabled = Template.bind({});
Disabled.args = {
  value: '',
  options: [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ],
  placeholder: 'Select an option',
  disabled: true,
};
`;

interface PackageJson {
  scripts?: Record<string, string>;
  [key: string]: any;
}

// Main function
async function setup(): Promise<void> {
  console.log('Setting up UI testing and Storybook environment...');
  
  // Create directories
  for (const dir of directories) {
    const dirPath = path.resolve(process.cwd(), dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  }
  
  // Create setup file
  fs.writeFileSync(
    path.resolve(process.cwd(), 'src/setupTests.ts'),
    setupFile.trim()
  );
  console.log('Created setup file: src/setupTests.ts');
  
  // Create test utils file
  fs.writeFileSync(
    path.resolve(process.cwd(), 'src/test-utils/index.tsx'),
    testUtilsFile.trim()
  );
  console.log('Created test utils file: src/test-utils/index.tsx');
  
  // Create Jest config
  fs.writeFileSync(
    path.resolve(process.cwd(), 'jest.config.js'),
    jestConfig.trim()
  );
  console.log('Created Jest config: jest.config.js');
  
  // Create Storybook configs
  const storybookConfigDir = path.resolve(process.cwd(), '.storybook');
  if (!fs.existsSync(storybookConfigDir)) {
    fs.mkdirSync(storybookConfigDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.resolve(storybookConfigDir, 'main.js'),
    storybookMain.trim()
  );
  console.log('Created Storybook main.js');
  
  fs.writeFileSync(
    path.resolve(storybookConfigDir, 'preview.js'),
    storybookPreview.trim()
  );
  console.log('Created Storybook preview.js');
  
  // Create EnhancedSelect story
  fs.writeFileSync(
    path.resolve(process.cwd(), 'src/stories/EnhancedSelect.stories.tsx'),
    enhancedSelectStory.trim()
  );
  console.log('Created EnhancedSelect story');
  
  // Install dependencies
  console.log('Installing dependencies...');
  try {
    execSync(`npm install --save-dev ${devDependencies.join(' ')}`, {
      stdio: 'inherit'
    });
    console.log('Dependencies installed successfully!');
  } catch (error) {
    if (error instanceof Error) {
      console.error('Failed to install dependencies:', error.message);
    } else {
      console.error('Failed to install dependencies:', error);
    }
    process.exit(1);
  }
  
  // Add scripts to package.json
  try {
    const packageJsonPath = path.resolve(process.cwd(), 'package.json');
    const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
    const packageJson: PackageJson = JSON.parse(packageJsonContent);
    
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }
    
    // Add testing scripts
    packageJson.scripts.test = 'jest';
    packageJson.scripts['test:watch'] = 'jest --watch';
    packageJson.scripts['test:coverage'] = 'jest --coverage';
    
    // Add Storybook scripts
    packageJson.scripts.storybook = 'start-storybook -p 6006';
    packageJson.scripts['build-storybook'] = 'build-storybook';
    packageJson.scripts['test-storybook'] = 'test-storybook';
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('Added test and Storybook scripts to package.json');
  } catch (error) {
    if (error instanceof Error) {
      console.error('Failed to update package.json:', error.message);
    } else {
      console.error('Failed to update package.json:', error);
    }
  }
  
  console.log('\nSetup complete! You can now:');
  console.log('  • Run tests with:');
  console.log('    npm test');
  console.log('    npm run test:watch');
  console.log('    npm run test:coverage');
  console.log('  • Run Storybook with:');
  console.log('    npm run storybook');
}

// Run the setup
setup().catch((error) => {
  console.error('Setup failed:', error);
  process.exit(1);
}); 