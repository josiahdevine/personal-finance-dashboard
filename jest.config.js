module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  testTimeout: 10000,
  maxWorkers: 1,
  roots: ['<rootDir>/src'],
  modulePaths: ['<rootDir>/src'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(axios|@firebase|firebase|@babel/runtime)/)'
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
    '!src/serviceWorker.ts'
  ],
  watchPathIgnorePatterns: ['node_modules'],
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)'
  ],
  verbose: true,
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  globals: {
    'fetch': global.fetch,
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}; 