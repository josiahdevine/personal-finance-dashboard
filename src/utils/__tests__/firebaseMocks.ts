// Mock implementation of Firebase Auth and Firestore
// This ensures tests can run without actual Firebase connections

// Auth mocks
const authMock = {
  currentUser: {
    uid: 'test-uid',
    email: 'test@example.com',
    displayName: 'Test User',
    emailVerified: true,
  },
  onAuthStateChanged: jest.fn((callback) => {
    callback(authMock.currentUser);
    return jest.fn(); // Unsubscribe function
  }),
  signInWithEmailAndPassword: jest.fn(() => Promise.resolve({
    user: authMock.currentUser
  })),
  createUserWithEmailAndPassword: jest.fn(() => Promise.resolve({
    user: authMock.currentUser
  })),
  signOut: jest.fn(() => Promise.resolve()),
  sendPasswordResetEmail: jest.fn(() => Promise.resolve()),
  sendEmailVerification: jest.fn(() => Promise.resolve()),
};

// Firestore mocks
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

const firestoreMock = {
  collection: jest.fn(() => collectionRefMock),
  doc: jest.fn(() => docRefMock),
  batch: jest.fn(() => ({
    set: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    commit: jest.fn(() => Promise.resolve()),
  })),
  runTransaction: jest.fn(() => Promise.resolve()),
};

// Export the mocks for use in tests
export { authMock, firestoreMock, docSnapMock, querySnapMock, docRefMock, collectionRefMock };
