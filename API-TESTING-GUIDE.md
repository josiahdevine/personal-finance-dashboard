# Personal Finance Dashboard - API Testing Guide

This guide provides instructions for testing API endpoints, authentication, and database connectivity in the Personal Finance Dashboard application.

## Overview

The Personal Finance Dashboard provides several API endpoints for managing financial data. All endpoints:

1. Require Firebase authentication
2. Return JSON responses
3. Include proper CORS headers
4. Provide consistent error formatting

## Prerequisites

To test the API endpoints, you'll need:

1. A Firebase account with authentication enabled
2. A Firebase auth token (ID token)
3. An API client (e.g., Postman, cURL, or the browser fetch API)
4. Access to the Netlify deployment or local development environment

## Authentication Testing

### 1. Get a Firebase ID Token

First, you need to authenticate with Firebase to get an ID token:

1. Log in to the application through the UI
2. Open the browser console (F12)
3. Run this command to get your current token:

```javascript
// In browser console
firebase.auth().currentUser.getIdToken(true)
  .then(token => { console.log(token); })
  .catch(error => { console.error(error); });
```

4. Copy the token value for use in API requests

### 2. Test Authentication

Use the health-check endpoint to verify authentication is working:

```bash
# Using cURL
curl -X GET "https://api.trypersonalfinance.com/health" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

Expected response (200 OK):
```json
{
  "status": "healthy",
  "timestamp": "2025-03-11T15:22:10.123Z",
  "api": {
    "status": "operational",
    "region": "us-east-1"
  },
  "database": {
    "connected": true,
    "currentTime": "2025-03-11T15:22:10.123Z",
    "tables": ["users", "salary_entries", "financial_goals", "plaid_accounts", "plaid_transactions", "schema_versions"]
  },
  "environment": {
    "node_env": "production",
    "has_firebase_config": true,
    "has_plaid_config": true,
    "has_db_config": true
  }
}
```

### 3. Test Unauthorized Access

Try accessing an endpoint without a token:

```bash
# Using cURL
curl -X GET "https://api.trypersonalfinance.com/api/goals"
```

Expected response (401 Unauthorized):
```json
{
  "error": "Unauthorized",
  "message": "Authentication required for this endpoint"
}
```

## API Endpoint Testing

### 1. Health Check Endpoint

This endpoint provides information about the API and database health:

```bash
# Using cURL
curl -X GET "https://api.trypersonalfinance.com/health" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

### 2. Plaid Status Endpoint

This endpoint checks the status of Plaid connection:

```bash
# Using cURL
curl -X GET "https://api.trypersonalfinance.com/api/plaid/status" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

Expected response (200 OK):
```json
{
  "status": "operational",
  "environment": "sandbox",
  "message": "Plaid API connection is functioning correctly",
  "userId": "your-firebase-user-id",
  "isAuthenticated": true,
  "timestamp": "2025-03-11T15:22:10.123Z"
}
```

### 3. Financial Goals Endpoints

#### Get All Goals

```bash
# Using cURL
curl -X GET "https://api.trypersonalfinance.com/api/goals" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

#### Create a Goal

```bash
# Using cURL
curl -X POST "https://api.trypersonalfinance.com/api/goals" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Emergency Fund",
    "targetAmount": 10000,
    "currentAmount": 5000,
    "targetDate": "2025-12-31T00:00:00Z",
    "category": "Savings",
    "description": "Six months of living expenses"
  }'
```

#### Update a Goal

```bash
# Using cURL
curl -X PUT "https://api.trypersonalfinance.com/api/goals/1" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentAmount": 6000,
    "name": "Emergency Fund (Updated)"
  }'
```

#### Delete a Goal

```bash
# Using cURL
curl -X DELETE "https://api.trypersonalfinance.com/api/goals/1" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

### 4. Salary Entries Endpoints

#### Get Salary Entries

```bash
# Using cURL
curl -X GET "https://api.trypersonalfinance.com/api/salary-entries" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

## Comprehensive API Test

The application includes a comprehensive API test endpoint that verifies:
1. Database connectivity
2. Schema validity
3. Data access

**Note**: This endpoint is only available in development mode.

```bash
# Using cURL
curl -X GET "https://api.trypersonalfinance.com/api/test" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

Expected response (200 OK):
```json
{
  "message": "API test completed",
  "results": {
    "timestamp": "2025-03-11T15:22:10.123Z",
    "environment": "development",
    "user": {
      "uid": "your-firebase-user-id",
      "isAuthenticated": true
    },
    "database": {
      "success": true,
      "details": {
        "connected": true,
        "tables": ["users", "salary_entries", "financial_goals", "plaid_accounts", "plaid_transactions", "schema_versions"]
      },
      "duration": "123ms"
    },
    "schema": {
      "success": true,
      "details": {
        "users": { "success": true },
        "salary_entries": { "success": true },
        "financial_goals": { "success": true }
      },
      "duration": "456ms"
    },
    "data": {
      "success": true,
      "details": {
        "salary_entries": {
          "success": true,
          "count": 3
        },
        "financial_goals": {
          "success": true,
          "count": 2
        }
      }
    }
  }
}
```

## Testing with JavaScript

Here's an example of testing the API using JavaScript in a browser or Node.js application:

```javascript
// Get the token (browser example)
async function getToken() {
  return await firebase.auth().currentUser.getIdToken(true);
}

// Test an endpoint
async function testEndpoint(endpoint) {
  const token = await getToken();
  
  const response = await fetch(`https://api.trypersonalfinance.com${endpoint}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  console.log(`Response from ${endpoint}:`, data);
  return data;
}

// Example usage
testEndpoint('/health')
  .then(data => console.log('Health check successful:', data))
  .catch(error => console.error('Health check failed:', error));
```

## Troubleshooting

### Common Issues and Solutions

1. **401 Unauthorized**
   - Verify your Firebase token is valid and not expired
   - Check that you're including the token in the Authorization header
   - Make sure the token format is correct: `Bearer YOUR_TOKEN`

2. **CORS Errors**
   - Ensure you're making requests from an allowed origin
   - Check that your browser isn't blocking cross-origin requests
   - Verify that preflight OPTIONS requests are working

3. **Database Connection Errors**
   - Check if the database is available (use the health check endpoint)
   - Verify environment variables are set correctly
   - Look at the Netlify function logs for detailed error messages

4. **500 Internal Server Error**
   - Check the Netlify function logs for detailed error information
   - Verify the request payload matches the expected format
   - Check database connectivity and schema

### Getting Help

If you encounter issues that you can't resolve:

1. Check the Netlify function logs for detailed error messages
2. Use the API test endpoint to verify system health
3. Verify your authentication setup in Firebase console
4. Ensure your database connection string is correct
5. Check for any API rate limiting in Plaid or Firebase

## Security Best Practices

When testing the API, follow these security best practices:

1. **Never share Firebase tokens** - These provide access to user accounts
2. **Don't commit tokens to source control** - Store them securely
3. **Use environment variables** for sensitive configuration
4. **Rotate tokens regularly** - Don't use the same token for extended periods
5. **Use HTTPS for all API requests** - Never send tokens over unencrypted connections 