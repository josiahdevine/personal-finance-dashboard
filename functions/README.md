# Personal Finance Dashboard - Netlify Functions

This directory contains the serverless functions that power the Personal Finance Dashboard API. These functions are deployed and run on Netlify's serverless infrastructure.

## Structure

```
functions/
├── utils/                    # Shared utility modules
│   ├── cors-handler.js       # CORS utilities
│   ├── db-connector.js       # Database connection utilities
│   └── auth-handler.js       # Authentication utilities
├── plaid-status.js          # Plaid connection status
├── plaid-link-token.js      # Create Plaid link token
├── plaid-accounts.js        # Retrieve Plaid accounts
├── plaid-transactions.js    # Retrieve Plaid transactions
├── salary-entries.js        # List salary entries
├── salary-create.js         # Create salary entry
├── salary-edit.js           # Edit salary entry
├── goals.js                 # Financial goals API
├── health-check.js          # API health check
├── cors-debug.js            # CORS debugging
├── cors-preflight.js        # CORS preflight handler
└── package.json             # Functions dependencies
```

## Utility Modules

### CORS Handler (`utils/cors-handler.js`)

The CORS handler provides standardized CORS handling for all API functions. It includes:

- `getCorsHeaders()` - Generates standardized CORS headers
- `handleCorsPreflightRequest()` - Handles OPTIONS preflight requests
- `createCorsResponse()` - Creates responses with proper CORS headers

### Database Connector (`utils/db-connector.js`)

The DB connector provides database connectivity utilities:

- `getDbPool()` - Gets a connection pool to the Neon Tech PostgreSQL database
- `query()` - Executes a database query with error handling and logging
- `checkDbStatus()` - Checks database connectivity and table existence
- `verifyTableSchema()` - Verifies and updates table schemas as needed

### Authentication Handler (`utils/auth-handler.js`)

The authentication handler provides Firebase authentication utilities:

- `getFirebaseAdmin()` - Initializes and gets the Firebase Admin SDK
- `verifyAuthToken()` - Verifies a Firebase authentication token
- `getUserFromRequest()` - Extracts user info from a request
- `requireAuth()` - Authentication middleware for Netlify functions

## Using the Utilities

Example of a protected function with CORS and auth:

```javascript
const corsHandler = require('./utils/cors-handler');
const authHandler = require('./utils/auth-handler');

exports.handler = authHandler.requireAuth(async function(event, context) {
  // User information is available in event.user
  const { uid, isAuthenticated } = event.user;
  
  // Handle your API logic here
  
  // Return a response with proper CORS headers
  return corsHandler.createCorsResponse(200, {
    message: "Success",
    data: { /* your data */ }
  }, event.headers.origin || '*');
}, { corsHandler });
```

## Authentication

All API endpoints automatically handle CORS preflight requests. Protected endpoints use Firebase authentication tokens. To call protected endpoints, include a Firebase ID token in the `Authorization` header:

```
Authorization: Bearer <firebase-id-token>
```

## Development

To install dependencies:

```bash
cd functions
npm install
```

## API Subdomain

The API is served from `https://api.trypersonalfinance.com` and is configured via redirects in `netlify.toml`. All CORS handling is managed both in the Netlify configuration and in individual functions.

## Available Endpoints

- `/health-check`: Returns the API health status
- `/create-link-token`: Creates a Plaid link token for connecting bank accounts

## Local Development

To test functions locally:

1. Install the Netlify CLI:
   ```
   npm install -g netlify-cli
   ```

2. Start the local development server:
   ```
   netlify dev
   ```

3. Access functions at `http://localhost:8888/.netlify/functions/health-check`

## Production Deployment

Functions are automatically deployed when pushing to the main branch. They will be available at:

- `https://api.trypersonalfinance.com/health-check`
- `https://api.trypersonalfinance.com/create-link-token`

## Adding New Functions

1. Create a new `.js` file in this directory
2. Export a handler function that follows this pattern:
   ```javascript
   exports.handler = async function(event, context) {
     // Your code here
     return {
       statusCode: 200,
       body: JSON.stringify({ message: "Success" })
     };
   }
   ```

3. The function will be available at `/.netlify/functions/your-file-name` or with the API subdomain at `/your-file-name`

## Environment Variables

Functions have access to environment variables set in the Netlify dashboard or in `netlify.toml`. 