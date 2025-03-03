# Plaid Development Setup with Mock Data

This document outlines how to set up and use the Plaid integration in development mode with mock data.

## Overview

We've implemented a mock data system for Plaid to facilitate development without requiring actual database connections or Plaid API credentials. This is particularly useful for:

- Local development without database setup
- UI testing without hitting API rate limits
- Development in environments without access to production credentials

## How It Works

The mock data system provides simulated responses for key Plaid API endpoints:

- `itemGet`: Returns mock item data
- `accountsGet`: Returns mock bank accounts
- `transactionsGet`: Returns mock transactions
- `linkTokenCreate`: Generates mock link tokens
- `itemPublicTokenExchange`: Simulates public token exchange

The system is automatically enabled when:
- The environment variable `USE_PLAID_MOCK` is set to `true`, OR
- Plaid API credentials are missing or invalid

## Setup Instructions

### 1. Configure Environment Variables

Add the following to your `.env` file:

```
# Enable mock mode for Plaid
USE_PLAID_MOCK=true
```

### 2. Run the Application

Start the application as usual with `npm start`. You should see the following message in the console:

```
⚠️ Using Plaid mock data - FOR DEVELOPMENT ONLY
```

### 3. Use the Application

When using the application in mock mode:

- The "Link Account" flow will work with any public token
- Account data will show the mock accounts from `server/plaid.js`
- Transaction data will show the mock transactions

## Mock Data

The mock data includes:

### Items
- 1 financial institution with ID `mock_item_1`

### Accounts
- Checking account with balance $1,250.45
- Savings account with balance $5,400.23
- Credit card with balance $745.86 and limit $3,000.00

### Transactions
- Coffee purchase for $25.50
- Grocery store purchase for $112.42
- Online shopping purchase for $49.99

## Customizing Mock Data

To customize the mock data, edit the `mockPlaidData` object in `server/plaid.js`. You can add more accounts, transactions, or modify the existing ones to test different scenarios.

## Database Migration Plan

The database migration for Plaid integration is defined in `db-migration/plaid_tables_migration.sql` and can be executed using `run_plaid_migration.js`. However, this requires:

1. A valid Neon PostgreSQL database connection
2. The `DATABASE_URL` environment variable to be properly set

For local development, you can skip the database migration and rely on mock data. When deploying to production, refer to the `plaid-production-deployment.md` document for proper database setup.

## Testing in Progress

- [ ] Testing Link flow with mock data
- [ ] Testing transaction refresh with mock data
- [ ] Testing balance updates with mock data

## Next Steps

1. Complete the testing checklist above
2. Expand mock data to cover more use cases
3. Implement proper database integration with Neon PostgreSQL

---

This setup enables developers to work on the application without needing to set up a database or obtain Plaid API credentials, making the development process faster and more accessible. 