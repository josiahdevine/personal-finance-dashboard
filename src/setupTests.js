// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import 'jest-axe/extend-expect';

// Mock Firebase modules
jest.mock('firebase/app', () => {
  return {
    initializeApp: jest.fn(() => ({})),
    getApps: jest.fn(() => []),
    getApp: jest.fn(() => ({}))
  };
});

jest.mock('firebase/auth', () => {
  const auth = {
    currentUser: {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
      emailVerified: true,
    },
    onAuthStateChanged: jest.fn((callback) => {
      callback(auth.currentUser);
      return jest.fn(); // Unsubscribe function
    }),
    signInWithEmailAndPassword: jest.fn(() => Promise.resolve({
      user: auth.currentUser
    })),
    createUserWithEmailAndPassword: jest.fn(() => Promise.resolve({
      user: auth.currentUser
    })),
    signOut: jest.fn(() => Promise.resolve()),
    sendPasswordResetEmail: jest.fn(() => Promise.resolve()),
    sendEmailVerification: jest.fn(() => Promise.resolve()),
  };

  return {
    getAuth: jest.fn(() => auth),
    signInWithEmailAndPassword: jest.fn(() => Promise.resolve({
      user: auth.currentUser
    })),
    createUserWithEmailAndPassword: jest.fn(() => Promise.resolve({
      user: auth.currentUser
    })),
    signOut: jest.fn(() => Promise.resolve()),
    onAuthStateChanged: jest.fn((auth, callback) => {
      callback(auth.currentUser);
      return jest.fn(); // Unsubscribe function
    }),
  };
});

jest.mock('firebase/firestore', () => {
  const docSnapMock = {
    exists: jest.fn(() => true),
    data: jest.fn(() => ({
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
      emailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })),
    id: 'test-uid',
  };

  const querySnapMock = {
    empty: false,
    docs: [docSnapMock],
    forEach: jest.fn((callback) => {
      callback(docSnapMock);
    }),
  };

  const docRefMock = {
    get: jest.fn(() => Promise.resolve(docSnapMock)),
    set: jest.fn(() => Promise.resolve()),
    update: jest.fn(() => Promise.resolve()),
    delete: jest.fn(() => Promise.resolve()),
    onSnapshot: jest.fn((callback) => {
      callback(docSnapMock);
      return jest.fn(); // Unsubscribe function
    }),
  };

  const collectionRefMock = {
    doc: jest.fn(() => docRefMock),
    add: jest.fn(() => Promise.resolve(docRefMock)),
    get: jest.fn(() => Promise.resolve(querySnapMock)),
    where: jest.fn(() => collectionRefMock),
    orderBy: jest.fn(() => collectionRefMock),
    limit: jest.fn(() => collectionRefMock),
    onSnapshot: jest.fn((callback) => {
      callback(querySnapMock);
      return jest.fn(); // Unsubscribe function
    }),
  };

  return {
    getFirestore: jest.fn(() => ({
      collection: jest.fn(() => collectionRefMock),
      doc: jest.fn(() => docRefMock),
      batch: jest.fn(() => ({
        set: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        commit: jest.fn(() => Promise.resolve()),
      })),
      runTransaction: jest.fn(() => Promise.resolve()),
    })),
    collection: jest.fn(() => collectionRefMock),
    doc: jest.fn(() => docRefMock),
    getDoc: jest.fn(() => Promise.resolve(docSnapMock)),
    getDocs: jest.fn(() => Promise.resolve(querySnapMock)),
    setDoc: jest.fn(() => Promise.resolve()),
    updateDoc: jest.fn(() => Promise.resolve()),
    deleteDoc: jest.fn(() => Promise.resolve()),
    onSnapshot: jest.fn((_, callback) => {
      callback(querySnapMock);
      return jest.fn(); // Unsubscribe function
    }),
  };
});

// Setup global mocks
jest.mock('./hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      uid: '123',
      email: 'test@example.com',
      displayName: 'Test User',
      emailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    isAuthenticated: true,
    isLoading: false
  })
}));

// Mock modules that often cause issues
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({
    pathname: '/dashboard'
  }),
  useParams: () => ({})
}));

// This addresses the act() warnings in React 18
// React 18 runs effects synchronously in tests, so we need to ensure all updates are flushed
global.IS_REACT_ACT_ENVIRONMENT = true;

// Mock Intersection Observer (often causes issues in tests)
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {
    return null;
  }
  unobserve() {
    return null;
  }
  disconnect() {
    return null;
  }
}

global.IntersectionObserver = MockIntersectionObserver;

// Mock react-query
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn().mockImplementation(() => ({
    data: [],
    error: null,
    isLoading: false,
    isError: false,
    refetch: jest.fn()
  })),
  useMutation: jest.fn().mockImplementation(() => ({
    mutate: jest.fn(),
    isLoading: false,
    isError: false,
    error: null
  }))
}));

// Mock window methods not available in test environment
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
    dispatchEvent: jest.fn()
  }))
});

// Suppress console errors during tests
const originalConsoleError = console.error;
console.error = (...args) => {
  // Filter out known warnings here to reduce noise
  if (
    args[0]?.includes('Warning: An update to') ||
    args[0]?.includes('Warning: Cannot update a component') ||
    args[0]?.includes('Warning: react-axe') ||
    args[0]?.includes('act(...)') ||
    args[0]?.includes('auth/invalid-api-key')
  ) {
    return;
  }
  originalConsoleError(...args);
};
