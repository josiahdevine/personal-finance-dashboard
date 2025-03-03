# Personal Finance Dashboard - Updated Plaid Integration Guide

This guide provides detailed instructions on how to use the updated Plaid integration in the Personal Finance Dashboard application.

## Overview of the Updated Plaid Integration

The Plaid integration has been completely revamped with the following improvements:

1. **Environment Variable Configuration**: All Plaid credentials are now stored in environment variables
2. **Flexible Environment Support**: Seamlessly switch between sandbox, development, and production environments
3. **Better Error Handling**: Comprehensive error handling and logging
4. **Webhook Support**: Support for Plaid webhooks for real-time updates
5. **Optimized Database Schema**: Improved database schema with proper indexes and constraints

## Setup Instructions

### 1. Environment Configuration

Set the following environment variables in your `.env` file:

```
# Plaid API credentials
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret
PLAID_ENV=sandbox|development|production

# Optional configuration
PLAID_PRODUCTS=transactions,auth
PLAID_COUNTRY_CODES=US
PLAID_REDIRECT_URI=https://yourdomain.com/link-accounts/oauth-callback

# Database configuration
DATABASE_URL=your_database_connection_string

# For development only
USE_PLAID_MOCK=true|false
```

### 2. Database Setup

Run the database migration script to create all the necessary Plaid tables:

```bash
cd db-migration
node run_plaid_migration.js
```

This will create the following tables:
- `plaid_items`: Stores connected financial institutions
- `plaid_accounts`: Stores account information
- `account_balances`: Tracks account balances over time
- `balance_history`: Stores historical balance data
- `plaid_transactions`: Stores transaction data
- `plaid_sync_cursor`: Tracks transaction sync progress
- `plaid_webhooks`: Logs webhook events

### 3. Server Setup

The server has been configured to use the Plaid client and routes. To start the server:

```bash
cd server
npm install
npm start
```

### 4. Frontend Configuration

Update your frontend environment variables in the `.env` file:

```
REACT_APP_PLAID_ENV=sandbox|development|production
```

## Using the Plaid Integration

### Connecting Bank Accounts

1. **Create Link Token**

   When a user wants to connect a bank account, first request a link token:

   ```javascript
   const response = await api.post('/api/plaid/create-link-token');
   const linkToken = response.data.link_token;
   ```

2. **Initialize Plaid Link**

   Use the link token to initialize Plaid Link:

   ```javascript
   const { open } = usePlaidLink({
     token: linkToken,
     onSuccess: (public_token, metadata) => {
       // Exchange the public token for an access token
       exchangeToken(public_token, metadata.institution);
     },
     onExit: (err, metadata) => {
       // Handle exit
       console.log('User exited Plaid Link');
     }
   });
   ```

3. **Exchange Public Token**

   Exchange the public token for an access token:

   ```javascript
   const exchangeToken = async (publicToken, institution) => {
     try {
       const response = await api.post('/api/plaid/exchange-token', {
         public_token: publicToken,
         institution: institution
       });
       // Handle success
     } catch (error) {
       // Handle error
     }
   };
   ```

### Retrieving Financial Data

1. **Get Accounts**

   Retrieve all connected accounts:

   ```javascript
   const getAccounts = async () => {
     const response = await api.get('/api/plaid/accounts');
     return response.data;
   };
   ```

2. **Get Transactions**

   Retrieve transactions for a date range:

   ```javascript
   const getTransactions = async (startDate, endDate) => {
     const response = await api.get('/api/plaid/transactions', {
       params: { startDate, endDate }
     });
     return response.data.transactions;
   };
   ```

3. **Sync Account Balances**

   Update account balances:

   ```javascript
   const syncBalances = async () => {
     const response = await api.post('/api/plaid/sync-balances');
     return response.data.balances;
   };
   ```

4. **Get Balance History**

   Retrieve historical balance data:

   ```javascript
   const getBalanceHistory = async (startDate, endDate) => {
     const response = await api.get('/api/plaid/balance-history', {
       params: { startDate, endDate }
     });
     return response.data.history;
   };
   ```

### Setting Up Webhooks

To receive real-time updates from Plaid, configure a webhook URL in the Plaid Dashboard:

1. Go to the Plaid Dashboard
2. Configure your webhook URL: `https://yourdomain.com/api/webhooks/plaid`
3. The server will automatically process incoming webhooks

## Error Handling

The integration includes comprehensive error handling:

1. **Client-Side Errors**:
   - `useEffect` error boundaries in React components
   - Fallback to localStorage for connection status

2. **Server-Side Errors**:
   - Detailed error logging
   - Specific error responses for common issues
   - Retry mechanisms for transient errors

## Development Mode

For development, you can enable mock mode by setting:

```
USE_PLAID_MOCK=true
```

This will use mock data instead of making real API calls to Plaid.

## Production Deployment

Before deploying to production:

1. Obtain production Plaid API credentials
2. Update environment variables with production values
3. Set `PLAID_ENV=production`
4. Configure production webhook URLs
5. Test thoroughly with real accounts

## Troubleshooting

### Common Issues

1. **Connection Issues**:
   - Check that your Plaid API credentials are correct
   - Verify your network connection

2. **Database Errors**:
   - Ensure the database migration has been run
   - Check the database connection string

3. **Webhook Issues**:
   - Confirm the webhook URL is accessible from the internet
   - Check server logs for webhook processing errors

### Debugging

Enable debug logging by setting:

```
DEBUG=true
```

This will output detailed logs to help diagnose issues.

## References

- [Plaid API Documentation](https://plaid.com/docs/api/)
- [React Plaid Link](https://github.com/plaid/react-plaid-link)
- [Plaid Node.js Client](https://github.com/plaid/plaid-node)

---

For additional assistance, please refer to the production deployment guide or contact the development team. 