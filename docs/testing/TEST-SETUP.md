# Personal Finance Dashboard - Test Setup Guide

This document provides comprehensive instructions for setting up and running tests for the Personal Finance Dashboard application.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v16.0.0 or later)
- npm (v8.0.0 or later) or Yarn (v1.22.0 or later)
- Git

## Environment Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/personal-finance-dashboard.git
   cd personal-finance-dashboard
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up test environment variables**:
   Create a `.env.test` file in the root directory:
   ```env
   # Database Configuration (Neon Tech)
   DATABASE_URL=your_test_db_url
   PGUSER=your_test_db_user
   PGPASSWORD=your_test_db_password
   PGDATABASE=your_test_db_name
   PGHOST=your_test_db_host
   PGPORT=5432
   PGSSLMODE=require

   # Plaid API Configuration (using sandbox)
   PLAID_CLIENT_ID=your_test_client_id
   PLAID_SECRET=your_test_secret
   PLAID_ENV=sandbox
   PLAID_WEBHOOK_SECRET=your_test_webhook_secret

   # Security Configuration
   ENCRYPTION_MASTER_KEY=test_encryption_key_must_be_32_chars_!!
   JWT_SECRET=test_jwt_secret_key_for_testing_only!!

   # Test Configuration
   NODE_ENV=test
   FAIL_FAST=false
   LOG_LEVEL=debug
   ```

## Running Tests

### 1. Unit Tests

Run unit tests with mocked dependencies:
```bash
npm run test:unit
# or
yarn test:unit
```

### 2. Integration Tests

Run integration tests with mocked database:
```bash
npm run test:integration
# or
yarn test:integration
```

### 3. API Tests

Run API tests with Plaid sandbox:
```bash
npm run test:api
# or
yarn test:api
```

## Test Configuration

### Database Mocking

The test suite uses a mocked database connection for integration tests. This is configured in `server/tests/mocks/db.mock.js`:

```javascript
const dbMock = {
  query: jest.fn(),
  end: jest.fn()
};

jest.mock('../../db', () => dbMock);
```

### JWT Authentication

Tests that require authentication use a test JWT token. This is configured in the test setup:

```javascript
const testToken = jwt.sign(
  { userId: 'test-user-id', email: 'test@example.com' },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);
```

## Troubleshooting Common Issues

### 1. Chai Assertion Library

If you encounter issues with Chai assertions, ensure you're using version 4.3.4:
```bash
npm install chai@4.3.4 --save-dev
```

### 2. Database Connection Issues

If tests fail due to database connection issues:
1. Verify your test database credentials
2. Check SSL mode configuration
3. Ensure the test database is accessible

### 3. JWT Authentication Errors

If you see 401 Unauthorized errors:
1. Check JWT_SECRET in .env.test
2. Verify token is being included in request headers
3. Check token expiration time

## Writing New Tests

### 1. API Tests

Follow this template for new API tests:
```javascript
describe('API Endpoint', () => {
  let testToken;
  
  before(async () => {
    testToken = generateTestToken();
  });

  it('should handle successful request', async () => {
    const response = await request
      .post('/api/endpoint')
      .set('Authorization', `Bearer ${testToken}`)
      .send(testData);
    
    expect(response.status).to.equal(200);
  });

  it('should handle error cases', async () => {
    // Test error scenarios
  });
});
```

### 2. Database Tests

Use the mocked database for database tests:
```javascript
describe('Database Operations', () => {
  beforeEach(() => {
    dbMock.query.mockReset();
  });

  it('should handle database operations', async () => {
    dbMock.query.mockResolvedValue({ rows: [], rowCount: 0 });
    // Test database operations
  });
});
```

## Continuous Integration

Tests are automatically run on:
- Pull request creation
- Push to main branch
- Daily scheduled runs

### CI Pipeline

1. Install dependencies
2. Run linter
3. Run unit tests
4. Run integration tests
5. Run API tests
6. Generate coverage report

## Test Coverage

To generate a test coverage report:
```bash
npm run test:coverage
# or
yarn test:coverage
```

Coverage requirements:
- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%

# Test Setup Documentation

## Current Test Coverage

### Navigation Components
- **AuthenticatedHeader**: ~80%
- **PublicNavbar**: ~80%
- **PrivateRoute**: ~90%

### Transaction Components
- **TransactionsList**: 0% (In Progress)
- **TransactionAnalytics**: 0% (In Progress)

### Goals Components
- **FinancialGoals**: 0% (Planned)
- **ProgressBar**: Pending

## Test Infrastructure

### Testing Libraries
- Jest
- React Testing Library
- @testing-library/user-event
- @testing-library/jest-dom

### Test File Structure
```
src/
├── Components/
│   ├── __tests__/          # Component tests
│   ├── auth/
│   │   └── __tests__/      # Auth component tests
│   ├── navigation/
│   │   └── __tests__/      # Navigation component tests
│   ├── transactions/
│   │   └── __tests__/      # Transaction component tests
│   └── goals/
│       └── __tests__/      # Goals component tests
```

### Test Configuration
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

## Testing Guidelines

### Component Testing
1. Test rendering
2. Test user interactions
3. Test error states
4. Test loading states
5. Test integration with context

### Example Test Structure
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('ComponentName', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  it('renders correctly', () => {
    // Test implementation
  });

  it('handles user interactions', async () => {
    // Test implementation
  });

  it('displays error states', () => {
    // Test implementation
  });
});
```

### Mocking
1. Context Providers
```typescript
jest.mock('../../../contexts/AuthContext');
```

2. API Calls
```typescript
jest.mock('../../../services/api');
```

3. Third-party Libraries
```typescript
jest.mock('react-router-dom');
```

## Running Tests

### Commands
- Run all tests: `npm test`
- Run with coverage: `npm test -- --coverage`
- Update snapshots: `npm test -- -u`
- Run specific test file: `npm test -- ComponentName.test.tsx`

### Continuous Integration
- Tests run on every pull request
- Coverage reports generated automatically
- Failed tests block merging

## Next Steps

### Short Term
1. Complete transaction component tests
2. Add tests for goals components
3. Implement E2E tests for critical paths
4. Add performance testing

### Medium Term
1. Increase coverage to 80%+ across all components
2. Add visual regression testing
3. Implement API mocking strategy
4. Add accessibility testing

### Long Term
1. Automated performance testing
2. Load testing for API endpoints
3. Cross-browser testing setup
4. Mobile testing infrastructure

## Best Practices

1. **Test Organization**
   - Group related tests
   - Use clear descriptions
   - Follow AAA pattern (Arrange, Act, Assert)
   - Keep tests focused

2. **Code Quality**
   - Use TypeScript for type safety
   - Follow DRY principles
   - Use proper assertions
   - Handle async operations correctly

3. **Maintenance**
   - Regular updates of test dependencies
   - Review and update snapshots
   - Monitor test performance
   - Document complex test setups

## Router Testing Guidelines

### Common Pitfalls

1. **Nested Routers**
   - Never wrap components in multiple `BrowserRouter` components
   - The `BrowserRouter` should only be present once at the root level
   - For testing, use `MemoryRouter` instead of `BrowserRouter`

2. **Router Context**
   - Components using router hooks (`useNavigate`, `useLocation`) must be wrapped in a router
   - Use `MemoryRouter` for testing components that need router context
   - Set initial entries for `MemoryRouter` to test specific routes

### Example Test Setup

```javascript
import { MemoryRouter } from 'react-router-dom';

const renderWithRouter = (component, { route = '/' } = {}) => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <ThemeProvider>
        <AuthProvider>
          {component}
        </AuthProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
};

// Usage in tests
it('should render protected route when authenticated', () => {
  renderWithRouter(<PrivateRoute><ProtectedComponent /></PrivateRoute>, {
    route: '/dashboard'
  });
  // Test assertions
});
```

### Best Practices

1. **Router Testing**
   - Use `MemoryRouter` for testing
   - Set initial routes to test specific scenarios
   - Mock navigation functions when needed
   - Test both authenticated and unauthenticated states

2. **Component Testing**
   - Test components in isolation
   - Mock router hooks when necessary
   - Test navigation behavior
   - Verify route protection

3. **Integration Testing**
   - Test complete navigation flows
   - Verify route changes
   - Test authentication redirects
   - Check protected route access 