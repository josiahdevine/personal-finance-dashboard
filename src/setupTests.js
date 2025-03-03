// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import './test/mocks';
import React from 'react';

// Configure testing-library
configure({ testIdAttribute: 'data-testid' });

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
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
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

// Mock for Firebase Auth functions
const mockUser = {
  uid: 'test-uid',
  email: 'test@example.com',
  displayName: 'Test User',
  emailVerified: true,
  isAnonymous: false,
  metadata: {
    creationTime: new Date().toISOString(),
    lastSignInTime: new Date().toISOString()
  },
  providerData: [{
    providerId: 'password',
    uid: 'test-uid',
    displayName: 'Test User',
    email: 'test@example.com',
    phoneNumber: null,
    photoURL: null
  }]
};

const mockUserCredential = {
  user: mockUser,
  providerId: 'anonymous',
  operationType: 'signIn'
};

const mockAuth = {
  currentUser: mockUser,
  tenantId: 'test-tenant-id',
  languageCode: 'en',
  apiKey: 'test-api-key',
  appName: 'test-app-name',
  authDomain: 'test-auth-domain.firebaseapp.com',
  config: {
    apiKey: 'test-api-key',
    authDomain: 'test-auth-domain.firebaseapp.com'
  },
  onAuthStateChanged: jest.fn(callback => {
    callback(mockUser);
    return () => {}; // Return unsubscribe function
  }),
  signInAnonymously: jest.fn(() => {
    return Promise.resolve(mockUserCredential);
  })
};

// Firebase AUTH Mocks
jest.mock('firebase/auth', () => {
  // Create a signInAnonymously function that returns a Promise
  const signInAnonymouslyMock = jest.fn(() => {
    return Promise.resolve(mockUserCredential);
  });
  
  // Create the module object with all the exports
  const authModule = {
    getAuth: jest.fn(() => mockAuth),
    signInAnonymously: signInAnonymouslyMock,
    signOut: jest.fn(() => {
      return Promise.resolve();
    }),
    setPersistence: jest.fn(() => {
      console.log('[Firebase] Auth persistence set to LOCAL successfully');
      return Promise.resolve();
    }),
    browserLocalPersistence: 'LOCAL',
    signInWithEmailAndPassword: jest.fn(() => {
      return Promise.resolve(mockUserCredential);
    }),
    createUserWithEmailAndPassword: jest.fn(() => {
      return Promise.resolve(mockUserCredential);
    }),
    onAuthStateChanged: jest.fn((auth, callback) => {
      callback(mockUser);
      return jest.fn(); // Return unsubscribe function
    })
  };
  
  // Return the module with all exports
  return authModule;
});

// Mock Firebase App
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(() => []),
}));

// Mock Firebase Firestore
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  getDocs: jest.fn(),
}));

// Mock IntersectionObserver
class IntersectionObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserver,
});

// Mock ResizeObserver
class ResizeObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: ResizeObserver,
});

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({
    pathname: '/',
    search: '',
    hash: '',
    state: null,
    key: 'default'
  }),
  useParams: () => ({}),
  useSearchParams: () => [new URLSearchParams(), jest.fn()],
  Link: ({ children, to }) => <a href={to}>{children}</a>,
  Navigate: ({ to }) => <div data-testid="navigate" data-to={to} />,
  Outlet: () => <div data-testid="outlet" />,
  Route: ({ children }) => <div data-testid="route">{children}</div>,
  Routes: ({ children }) => <div data-testid="routes">{children}</div>,
  BrowserRouter: ({ children }) => <div data-testid="browser-router">{children}</div>,
  MemoryRouter: ({ children }) => <div data-testid="memory-router">{children}</div>,
  HashRouter: ({ children }) => <div data-testid="hash-router">{children}</div>,
  StaticRouter: ({ children }) => <div data-testid="static-router">{children}</div>,
  RouterProvider: ({ children }) => <div data-testid="router-provider">{children}</div>,
  createBrowserRouter: () => [],
  createMemoryRouter: () => [],
  createHashRouter: () => [],
  createStaticRouter: () => []
}));
