// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob()),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
  })
);

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() { return null; }
  unobserve() { return null; }
  disconnect() { return null; }
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() { return null; }
  unobserve() { return null; }
  disconnect() { return null; }
};

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

// Mock Firebase Auth Providers
class MockGoogleAuthProvider {
  constructor() {
    return {
      setCustomParameters: jest.fn(),
      addScope: jest.fn()
    };
  }
}

class MockGithubAuthProvider {
  constructor() {
    return {
      setCustomParameters: jest.fn(),
      addScope: jest.fn()
    };
  }
}

// Mock Firebase Auth
const mockAuth = {
  currentUser: null,
  onAuthStateChanged: jest.fn(),
  signOut: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  updateProfile: jest.fn(),
  setPersistence: jest.fn().mockResolvedValue(true),
  ensureAuth: jest.fn(() => Promise.resolve(true)),
  getCurrentUser: jest.fn(() => Promise.resolve({ uid: '1', email: 'test@example.com', displayName: 'Test User' })),
  GoogleAuthProvider: MockGoogleAuthProvider,
  GithubAuthProvider: MockGithubAuthProvider,
  signInWithPopup: jest.fn(),
  signInWithRedirect: jest.fn(),
  getRedirectResult: jest.fn(),
  browserLocalPersistence: 'LOCAL',
  browserSessionPersistence: 'SESSION',
  inMemoryPersistence: 'NONE'
};

const mockFirebase = {
  initializeApp: jest.fn(),
  getAuth: jest.fn(() => mockAuth),
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
  startAfter: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  serverTimestamp: jest.fn(),
  Timestamp: {
    now: jest.fn(),
    fromDate: jest.fn(),
    toDate: jest.fn()
  }
};

// Mock Firebase modules
jest.mock('firebase/app', () => mockFirebase);
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => mockAuth),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
  updateProfile: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  setPersistence: jest.fn().mockResolvedValue(true),
  browserLocalPersistence: jest.fn(),
  browserSessionPersistence: jest.fn(),
  inMemoryPersistence: jest.fn(),
  GoogleAuthProvider: MockGoogleAuthProvider,
  GithubAuthProvider: MockGithubAuthProvider,
  signInWithPopup: jest.fn(),
  signInWithRedirect: jest.fn(),
  getRedirectResult: jest.fn()
}));
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
  startAfter: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  serverTimestamp: jest.fn(),
  Timestamp: {
    now: jest.fn(),
    fromDate: jest.fn(),
    toDate: jest.fn()
  }
})); 