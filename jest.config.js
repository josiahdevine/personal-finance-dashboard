/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: [
    '<rootDir>/src/setupTests.ts'
  ],
  moduleNameMapper: {
    // Handle CSS imports (with CSS modules)
    '\\.module\\.(css|scss|sass)$': 'identity-obj-proxy',
    
    // Handle CSS imports (without CSS modules)
    '\\.(css|scss|sass)$': '<rootDir>/__mocks__/styleMock.js',
    
    // Handle static assets
    '\\.(jpg|jpeg|png|gif|webp|svg|ttf|woff|woff2)$': '<rootDir>/__mocks__/fileMock.js',
    
    // Handle path aliases (if you use them in tsconfig)
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  // Configure coverage reporting
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/index.tsx',
    '!src/serviceWorker.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  // Accessibility specific settings
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/.storybook/',
    '/scripts/'  // Ignore scripts directory where the setup-testing.js file is
  ],
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
  // Custom settings for jest-axe
  extraGlobals: ['Math'],
}; 