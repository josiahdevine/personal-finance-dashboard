#!/usr/bin/env node
/**
 * This script installs all the necessary dependencies for testing the UI components
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file's directory (equivalent to __dirname in CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the packages to install
const devDependencies = [
  '@testing-library/react',
  '@testing-library/user-event',
  '@testing-library/jest-dom',
  'jest',
  'jest-environment-jsdom',
  'ts-jest',
  '@types/jest',
  'axe-core',
  '@axe-core/react'
];

// Define directories to create
const directories = [
  'src/components/ui/__tests__',
  'src/test-utils'
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
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
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
) => render(ui, { wrapper: AllTheProviders, ...options });

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

// Main function
async function setup() {
  console.log('Setting up UI testing environment...');
  
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
  
  // Install dependencies
  console.log('Installing dependencies...');
  try {
    execSync(`npm install --save-dev ${devDependencies.join(' ')}`, {
      stdio: 'inherit'
    });
    console.log('Dependencies installed successfully!');
  } catch (error) {
    console.error('Failed to install dependencies:', error.message);
    process.exit(1);
  }
  
  // Add test script to package.json
  try {
    const packageJsonPath = path.resolve(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }
    
    packageJson.scripts.test = 'jest';
    packageJson.scripts['test:watch'] = 'jest --watch';
    packageJson.scripts['test:coverage'] = 'jest --coverage';
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('Added test scripts to package.json');
  } catch (error) {
    console.error('Failed to update package.json:', error.message);
  }
  
  console.log('\nSetup complete! You can now run tests with:');
  console.log('  npm test');
  console.log('  npm run test:watch');
  console.log('  npm run test:coverage');
}

// Run the setup
setup().catch(console.error);

// Import necessary testing libraries
require('@testing-library/jest-dom');
require('jest-axe/extend-expect');

// Mock global objects that might not be available in test environment
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver for ShadCN UI components
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
}));

// Mock matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock requestAnimationFrame for animations/transitions
global.requestAnimationFrame = callback => setTimeout(callback, 0);

// Set a default test timeout
jest.setTimeout(10000);

// Console error suppression for specific React warnings (customize as needed)
const originalConsoleError = console.error;
console.error = (...args) => {
  // Suppress specific React warnings if needed
  const suppressedWarnings = [
    // Add warning message substrings to suppress here
    // Example: 'Warning: ReactDOM.render is no longer supported',
  ];
  
  if (suppressedWarnings.some(warning => args[0] && args[0].includes && args[0].includes(warning))) {
    return;
  }
  
  originalConsoleError(...args);
}; 