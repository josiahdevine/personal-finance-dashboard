# Technical Documentation

## Architecture Overview

### Frontend Architecture
1. **Component Structure**
   ```
   src/
   ├── components/
   │   ├── Dashboard/
   │   │   ├── index.tsx
   │   │   ├── Overview.tsx
   │   │   ├── MobileOverview.tsx
   │   │   ├── ResponsiveDashboard.tsx
   │   │   └── Charts/
   │   ├── ManualAccountForm/
   │   │   └── index.tsx
   │   ├── auth/
   │   │   ├── Login.tsx
   │   │   └── Register.tsx
   │   └── shared/
   ├── services/
   │   ├── PlaidService.ts
   │   ├── ManualAccountService.ts
   │   ├── AccountAggregationService.ts
   │   └── api.ts
   ├── hooks/
   │   ├── useAuth.ts
   │   └── usePlaidLink.ts
   └── utils/
       ├── tokenStorage.ts
       └── formatters.ts
   ```

2. **State Management**
   - Context API for global state (AuthContext)
   - Local state with useState for component-level state
   - Custom hooks for shared logic and API integrations

3. **Authentication Flow**
   ```mermaid
   graph TD
   A[Login/Register Page] --> B{Auth Context}
   B --> C[Protected Routes]
   B --> D[API Requests]
   ```

4. **Responsive Design**
   - Mobile-first approach
   - Responsive breakpoints:
     - Mobile: < 768px
     - Desktop: ≥ 768px
   - Separate components for mobile and desktop views
   - Touch-optimized mobile interface

### Backend Architecture
1. **Database Schema**
   ```sql
   -- Core Tables
   users
   ├── id UUID PK
   ├── email VARCHAR
   └── name VARCHAR

   plaid_accounts
   ├── id UUID PK
   ├── user_id UUID FK
   ├── item_id VARCHAR
   ├── access_token VARCHAR
   ├── access_token_iv VARCHAR
   ├── access_token_tag VARCHAR
   ├── account_id VARCHAR
   ├── account_name VARCHAR
   ├── account_type VARCHAR
   ├── account_subtype VARCHAR
   ├── institution_name VARCHAR
   └── mask VARCHAR

   manual_accounts
   ├── id UUID PK
   ├── user_id UUID FK
   ├── account_name VARCHAR
   ├── account_type VARCHAR
   ├── balance DECIMAL
   ├── institution VARCHAR
   └── notes TEXT
   ```

2. **API Routes**
   ```
   /api
   ├── /auth
   │   ├── POST /login
   │   ├── POST /register
   │   └── GET /me
   ├── /plaid
   │   ├── POST /create-link-token
   │   ├── POST /exchange-token
   │   ├── GET /accounts/:userId
   │   ├── POST /refresh/:userId
   │   ├── POST /sync/:userId
   │   └── POST /webhook
   └── /manual-accounts
       ├── GET /user/:userId
       ├── POST /
       ├── PATCH /:id
       └── DELETE /:id
   ```

## Plaid Integration

### Configuration
```typescript
const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.REACT_APP_PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.REACT_APP_PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.REACT_APP_PLAID_SECRET,
    },
  },
});
```

### Link Token Flow
1. Frontend requests link token
2. Backend creates token with Plaid
3. Frontend initializes Plaid Link
4. User completes authentication
5. Frontend exchanges public token
6. Backend stores encrypted access token

### Account Aggregation
The `AccountAggregationService` combines data from:
- Plaid-connected accounts
- Manual accounts
- Provides unified interface for:
  - Account balances
  - Transaction history
  - Institution information

### Security Implementation

1. **Token Encryption**
   - Algorithm: AES-256-GCM
   - Secure storage of Plaid access tokens
   - Environment-based encryption keys

2. **Authentication**
   - JWT-based authentication
   - Token expiration and refresh
   - Protected API routes

3. **Database Security**
   ```sql
   ALTER TABLE manual_accounts ENABLE ROW LEVEL SECURITY;
   CREATE POLICY account_access ON manual_accounts
     USING (user_id = current_user_id());
   ```

## Error Handling

### Frontend Error Handling
```typescript
try {
  await service.method();
} catch (error) {
  if (error instanceof ApiError) {
    // Handle API errors
  } else if (error instanceof NetworkError) {
    // Handle network errors
  } else {
    // Handle unknown errors
  }
}
```

### Backend Error Handling
```typescript
router.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof ValidationError) {
    return res.status(400).json({
      message: 'Validation error',
      errors: error.errors
    });
  }
  // Handle other errors
});
```

## Environment Variables
```env
# Required
REACT_APP_API_URL=http://localhost:3000
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
JWT_SECRET=your-jwt-secret
REACT_APP_PLAID_ENV=sandbox
REACT_APP_PLAID_CLIENT_ID=your-client-id
REACT_APP_PLAID_SECRET=your-secret

# Optional
REACT_APP_PLAID_WEBHOOK_URL=your-webhook-url
```

## Deployment

### Build Process
```bash
# Install dependencies
npm install

# Run migrations
npm run migrate

# Build frontend
npm run build

# Start server
npm start
```

### Production Considerations
1. SSL/TLS encryption
2. Database connection pooling
3. Rate limiting
4. Error monitoring
5. Performance tracking 