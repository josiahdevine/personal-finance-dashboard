// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import './test/mocks';
import React from 'react';
import { jest } from '@jest/globals';
import { act } from '@testing-library/react';

// Configure testing-library
configure({
  testIdAttribute: 'data-testid',
  asyncUtilTimeout: 5000,
  defaultHidden: true,
  throwSuggestions: true,
  eventWrapper: (cb) => {
    let result;
    act(() => {
      result = cb();
    });
    return result;
  }
});

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockImplementation(() => ({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
}));
window.IntersectionObserver = mockIntersectionObserver;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: () => ({
    matches: false,
    media: '',
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob()),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
  })
);

// Mock window.location for API and Firebase services
const mockWindow = {
  location: {
    hostname: 'localhost',
    port: '8888',
    origin: 'http://localhost:8888'
  }
};

Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true
});

// Mock localStorage
const mockLocalStorage = {
  store: {},
  getItem: function(key) { return this.store[key]; },
  setItem: function(key, value) { this.store[key] = value; },
  removeItem: function(key) { delete this.store[key]; },
  clear: function() { this.store = {}; }
};

Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

// Mock process.env
process.env.NODE_ENV = 'test';
process.env.REACT_APP_API_BASE_URL = 'http://localhost:8888/.netlify/functions';
process.env.REACT_APP_FIREBASE_API_KEY = 'test-api-key';
process.env.REACT_APP_FIREBASE_AUTH_DOMAIN = 'test-auth-domain';
process.env.REACT_APP_FIREBASE_PROJECT_ID = 'test-project-id';
process.env.REACT_APP_FIREBASE_STORAGE_BUCKET = 'test-storage-bucket';
process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID = 'test-messaging-sender-id';
process.env.REACT_APP_FIREBASE_APP_ID = 'test-app-id';
process.env.REACT_APP_FIREBASE_MEASUREMENT_ID = 'test-measurement-id';

// Mock axios
const mockAxiosInstance = {
  defaults: {
    baseURL: 'http://localhost:8888/.netlify/functions'
  },
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() }
  },
  get: jest.fn().mockResolvedValue({ data: {} }),
  post: jest.fn().mockResolvedValue({ data: {} }),
  put: jest.fn().mockResolvedValue({ data: {} }),
  delete: jest.fn().mockResolvedValue({ data: {} })
};

jest.mock('axios', () => ({
  create: jest.fn(() => mockAxiosInstance),
  defaults: {
    baseURL: 'http://localhost:8888/.netlify/functions'
  },
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() }
  },
  get: jest.fn().mockResolvedValue({ data: {} }),
  post: jest.fn().mockResolvedValue({ data: {} }),
  put: jest.fn().mockResolvedValue({ data: {} }),
  delete: jest.fn().mockResolvedValue({ data: {} })
}));

// Mock Firebase
const mockAuth = {
  currentUser: null,
  config: {
    apiKey: 'test-api-key',
    authDomain: 'test-auth-domain',
    projectId: 'test-project-id',
    storageBucket: 'test-storage-bucket',
    messagingSenderId: 'test-sender-id',
    appId: 'test-app-id',
    measurementId: 'test-measurement-id'
  },
  setPersistence: jest.fn().mockResolvedValue(undefined),
  signInWithEmailAndPassword: jest.fn().mockResolvedValue({
    user: {
      uid: 'test-uid',
      email: 'test@example.com'
    }
  }),
  createUserWithEmailAndPassword: jest.fn().mockResolvedValue({
    user: {
      uid: 'test-uid',
      email: 'test@example.com'
    }
  }),
  signOut: jest.fn().mockResolvedValue(undefined)
};

const mockApp = {
  name: '[DEFAULT]',
  options: mockAuth.config,
  automaticDataCollectionEnabled: false
};

jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => mockApp),
  getApp: jest.fn(() => mockApp)
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => mockAuth),
  setPersistence: jest.fn().mockResolvedValue(undefined),
  browserLocalPersistence: 'LOCAL',
  signInWithEmailAndPassword: jest.fn().mockImplementation(mockAuth.signInWithEmailAndPassword),
  createUserWithEmailAndPassword: jest.fn().mockImplementation(mockAuth.createUserWithEmailAndPassword),
  signOut: jest.fn().mockImplementation(mockAuth.signOut),
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback(mockAuth.currentUser);
    return () => {};
  })
}));

// Mock window.matchMedia
window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {}
  };
};

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor() {
    this.observe = jest.fn();
    this.unobserve = jest.fn();
    this.disconnect = jest.fn();
  }
}

window.IntersectionObserver = MockIntersectionObserver;

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  mockAuth.currentUser = null;
});

// Suppress specific console errors during tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      /Warning.*not wrapped in act/.test(args[0]) ||
      /Warning.*Cannot update a component/.test(args[0]) ||
      /Warning.*React.createElement: type is invalid/.test(args[0])
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
