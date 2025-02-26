# Plaid Production Deployment Guide

This guide provides instructions for deploying the Plaid integration to the production environment.

## Changes Implemented

We have made the following changes to prepare the Plaid integration for production:

1. **Documentation Created**:
   - Created `documentation/plaid-implementation.md` with a complete analysis of the current implementation and recommendations for improvement
   - Identified critical issues including hardcoded credentials, inadequate error handling, and environment configuration

2. **Database Migrations**:
   - Created `db-migration/plaid_tables_migration.sql` with all necessary tables for Plaid integration
   - Added proper foreign key constraints, indices, and triggers for data integrity and performance
   - Enhanced the schema with additional fields for better error handling, tracking, and feature support

3. **Code Improvements**:
   - Refactored `server/plaid.js` to use environment variables instead of hardcoded credentials
   - Added proper error logging and configuration status reporting
   - Added environment detection to support different Plaid environments (sandbox, development, production)

## Deployment Checklist

Before deploying to production, ensure the following steps are completed:

### 1. Environment Configuration

- [ ] Create production `.env` file with correct Plaid API credentials
- [ ] Ensure the following variables are set:
  ```
  PLAID_CLIENT_ID=your_production_client_id
  PLAID_SECRET=your_production_secret
  PLAID_ENV=production
  PLAID_PRODUCTS=transactions,auth
  PLAID_COUNTRY_CODES=US,CA
  PLAID_REDIRECT_URI=https://yourdomain.com/link-accounts/oauth-callback
  ```

### 2. Database Migration

- [ ] Run the Plaid tables migration script on production database:
  ```
  cd db-migration
  node run_plaid_migration.js
  ```
- [ ] Verify all tables, indices, and triggers have been created successfully
- [ ] Back up the existing database before running migrations if it contains production data

### 3. API Configuration

- [ ] Update API endpoints on the frontend to point to production servers
- [ ] Configure CORS settings on production server to allow requests from your domain
- [ ] Set up Plaid webhooks to your production endpoint:
  ```
  https://yourdomain.com/api/plaid/webhooks
  ```

### 4. Security Measures

- [ ] Implement proper encryption for access tokens in the database
- [ ] Set up HTTPS for all API endpoints
- [ ] Implement rate limiting for API endpoints
- [ ] Review and restrict access to sensitive API endpoints

### 5. Testing

- [ ] Test the entire Plaid flow in production environment with real accounts
- [ ] Verify data is being properly saved and retrieved
- [ ] Test webhook functionality with real data
- [ ] Check error handling with various error scenarios

### 6. Monitoring

- [ ] Set up logging for Plaid API interactions
- [ ] Configure alerts for API errors and rate limit warnings
- [ ] Implement monitoring for connection failures and automatic recovery

## Rollback Plan

In case of deployment issues, have a rollback plan ready:

1. Keep a backup of the database before running migrations
2. Prepare scripts to revert database changes if needed
3. Maintain the ability to switch back to the previous version of the code

## Post-Deployment Verification

After deployment, verify:

1. Users can connect accounts via Plaid Link
2. Transactions are syncing correctly
3. Balance information is accurate and updating
4. Webhooks are being received and processed
5. Error handling is functioning as expected

## Known Limitations

- The current implementation does not fully implement all recommended security measures
- Webhook handling needs to be set up separately in the server routes
- Rate limiting should be implemented to avoid hitting Plaid API limits

## Support Plan

If issues arise in production:

1. Check the server logs for specific error messages
2. Verify environment variables are correctly set
3. Test connections to Plaid API from production server
4. Review recent changes that might have affected the integration

## Production Environment Setup

## Troubleshooting Common Production Issues

### Link Token Creation Failures

If you're seeing "Failed to create link token for Plaid" errors in production, check the following:

1. **Environment Variables**: Verify that all required Plaid environment variables are correctly set in your production environment:
   - `PLAID_CLIENT_ID`
   - `PLAID_SECRET`
   - `PLAID_ENV` (should be set to 'development' or 'production', not 'sandbox' for real data)
   - `PLAID_PRODUCTS` (comma-separated list of Plaid products you're using)
   - `PLAID_COUNTRY_CODES` (e.g., 'US')

2. **API Initialization**: Check the browser console for errors like `[PlaidContext] ERROR: API not properly initialized`. This suggests that:
   - The API client might not be properly initialized
   - The backend API might not be accessible from the frontend
   - There might be CORS issues preventing API access

3. **Network Connectivity**: Look for `net::ERR_BLOCKED_BY_CLIENT` errors, which can indicate:
   - Content blockers (like ad blockers) are preventing resources from loading
   - CORS headers are missing or incorrectly configured
   - Network connectivity issues between client and server

### Authentication Issues

If you're seeing authentication errors with Firebase:

1. **Firebase Configuration**: Verify that the Firebase configuration is correct in production:
   - Check if the Firebase project is properly set up for production
   - Ensure that the correct Firebase configuration is being used (development vs. production)

2. **Authentication Rules**: For errors like "auth/admin-restricted-operation":
   - Check that you have the appropriate authentication methods enabled in Firebase Console
   - Verify that anonymous authentication is properly configured if you're using it
   - Review any custom Firebase security rules that might be restricting access

### Account Loading Failures

For "Failed to load accounts" errors:

1. **Database Connection**: Verify that your application can connect to the production database:
   - Check database connection strings in environment variables
   - Ensure the database is accessible from your production server
   - Check that necessary database tables and schema are properly set up

2. **Error Handling**: Improve error handling to provide more specific error messages:
   - Check server logs for detailed error information
   - Consider adding more detailed error reporting in the frontend

## Quick Fixes for Common Issues

1. **API Initialization Issues**:
   ```javascript
   // Add this check before making API calls
   if (typeof api !== 'object' || api === null || typeof api.post !== 'function') {
     console.error('API not properly initialized:', typeof api);
     // Implement fallback or retry mechanism
   }
   ```

2. **CORS Issues**:
   ```javascript
   // Server-side CORS configuration (Node.js/Express)
   app.use(cors({
     origin: process.env.FRONTEND_URL || 'https://your-production-domain.com',
     methods: ['GET', 'POST', 'PUT', 'DELETE'],
     credentials: true
   }));
   ```

3. **Production Environment Variables**:
   ```bash
   # Required environment variables for production
   PLAID_CLIENT_ID=your_client_id
   PLAID_SECRET=your_production_secret
   PLAID_ENV=production
   PLAID_PRODUCTS=transactions,auth,balance
   PLAID_COUNTRY_CODES=US
   DATABASE_URL=your_production_db_url
   FIREBASE_API_KEY=your_firebase_api_key
   # ... other Firebase configuration variables
   ```

## Monitoring and Logging

For better visibility into production issues:

1. **Enhanced Logging**: Implement more detailed logging for Plaid operations
2. **Error Tracking**: Consider implementing Sentry or a similar error tracking service
3. **Performance Monitoring**: Monitor API response times and error rates to identify issues early

---

By following this deployment guide, you should be able to successfully transition the Plaid integration from development to production while ensuring security, data integrity, and reliability. 