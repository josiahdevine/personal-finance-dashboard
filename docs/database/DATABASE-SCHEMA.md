# Personal Finance Dashboard - Database Schema

This document outlines the database schema for the Personal Finance Dashboard application, including table structures, relationships, and how to work with the data.

## Overview

The Personal Finance Dashboard uses a PostgreSQL database hosted on [Neon Tech](https://neon.tech/) for storing user data, financial information, and application state. Our database is designed to:

1. Support user-specific data isolation
2. Track financial information securely
3. Enable comprehensive financial analysis
4. Maintain historical data for trends
5. Support automatic schema updates

## Database Schema

Below is the detailed schema for each table in the database.

### schema_versions

This table tracks the version history of the database schema for each table.

| Column      | Type                       | Description                          |
|-------------|----------------------------|--------------------------------------|
| id          | SERIAL PRIMARY KEY         | Unique identifier for version record |
| table_name  | VARCHAR(100) NOT NULL      | Name of the table being versioned    |
| version     | INTEGER NOT NULL           | Schema version number                |
| applied_at  | TIMESTAMP WITH TIME ZONE   | When the version was applied         |
| details     | TEXT                       | Description of the version change    |

### users

This table stores user account information.

| Column        | Type                       | Description                     |
|---------------|----------------------------|---------------------------------|
| id            | VARCHAR(100) PRIMARY KEY   | User ID from Firebase Auth      |
| email         | VARCHAR(255) UNIQUE        | User's email address            |
| display_name  | VARCHAR(100)               | User's display name             |
| created_at    | TIMESTAMP WITH TIME ZONE   | When the account was created    |
| updated_at    | TIMESTAMP WITH TIME ZONE   | When the account was last updated |
| last_login    | TIMESTAMP WITH TIME ZONE   | When the user last logged in    |

### salary_entries

This table stores salary and income information.

| Column          | Type                     | Description                        |
|-----------------|--------------------------|------------------------------------|
| id              | VARCHAR(36) PRIMARY KEY  | Unique identifier for salary entry |
| user_id         | VARCHAR(100) NOT NULL    | Reference to users.id              |
| user_profile_id | VARCHAR(50) NOT NULL     | Profile identifier for the user    |
| date            | DATE NOT NULL            | Date of salary payment             |
| gross_pay       | DECIMAL(10, 2) NOT NULL  | Gross pay amount                   |
| net_pay         | DECIMAL(10, 2) NOT NULL  | Net pay amount                     |
| taxes           | DECIMAL(10, 2) NOT NULL  | Total taxes                        |
| deductions      | DECIMAL(10, 2) NOT NULL  | Total deductions                   |
| details         | JSONB                    | Detailed breakdown of taxes and deductions |
| created_at      | TIMESTAMP WITH TIME ZONE | When entry was created             |
| updated_at      | TIMESTAMP WITH TIME ZONE | When entry was last updated        |

The `details` JSONB column may contain the following fields:
```json
{
  "federalTax": 800.00,
  "stateTax": 200.00,
  "socialSecurity": 310.00,
  "medicare": 72.50,
  "retirement401k": 250.00,
  "healthInsurance": 150.00
}
```

### financial_goals

This table stores user financial goals.

| Column         | Type                      | Description                       |
|----------------|---------------------------|-----------------------------------|
| id             | SERIAL PRIMARY KEY        | Unique identifier for goal        |
| user_id        | VARCHAR(100) NOT NULL     | Reference to users.id             |
| name           | VARCHAR(200) NOT NULL     | Goal name                         |
| target_amount  | DECIMAL(12, 2) NOT NULL   | Target amount for goal            |
| current_amount | DECIMAL(12, 2) DEFAULT 0  | Current progress amount           |
| start_date     | TIMESTAMP WITH TIME ZONE  | When goal was started             |
| target_date    | TIMESTAMP WITH TIME ZONE  | Target completion date            |
| category       | VARCHAR(100)              | Goal category                     |
| description    | TEXT                      | Detailed goal description         |
| status         | VARCHAR(50)               | Goal status (active, completed, etc) |
| created_at     | TIMESTAMP WITH TIME ZONE  | When goal was created             |
| updated_at     | TIMESTAMP WITH TIME ZONE  | When goal was last updated        |

### plaid_accounts

This table stores connected financial accounts via Plaid.

| Column                  | Type                    | Description                      |
|-------------------------|--------------------------|---------------------------------|
| id                      | VARCHAR(100) PRIMARY KEY | Account ID from Plaid           |
| user_id                 | VARCHAR(100) NOT NULL   | Reference to users.id            |
| item_id                 | VARCHAR(100) NOT NULL   | Plaid Item ID                    |
| institution_id          | VARCHAR(100)            | Financial institution ID         |
| institution_name        | VARCHAR(255)            | Financial institution name       |
| account_name            | VARCHAR(255)            | Account name                     |
| account_type            | VARCHAR(50)             | Account type (checking, savings) |
| account_subtype         | VARCHAR(50)             | Account subtype                  |
| mask                    | VARCHAR(10)             | Last 4 digits of account number  |
| balance_available       | DECIMAL(12, 2)          | Available balance                |
| balance_current         | DECIMAL(12, 2)          | Current balance                  |
| balance_limit           | DECIMAL(12, 2)          | Credit limit (if applicable)     |
| balance_iso_currency_code | VARCHAR(10) DEFAULT 'USD' | Currency code                |
| last_updated            | TIMESTAMP WITH TIME ZONE | When balance was last updated   |
| created_at              | TIMESTAMP WITH TIME ZONE | When account was added          |
| updated_at              | TIMESTAMP WITH TIME ZONE | When account was last updated   |
| is_active               | BOOLEAN DEFAULT TRUE    | Whether account is active        |

### plaid_transactions

This table stores financial transactions from Plaid.

| Column                  | Type                      | Description                      |
|-------------------------|---------------------------|----------------------------------|
| id                      | VARCHAR(100) PRIMARY KEY  | Unique identifier                |
| user_id                 | VARCHAR(100) NOT NULL     | Reference to users.id            |
| account_id              | VARCHAR(100) NOT NULL     | Reference to plaid_accounts.id   |
| transaction_id          | VARCHAR(100) NOT NULL     | Transaction ID from Plaid        |
| category_id             | VARCHAR(100)              | Category ID from Plaid           |
| category                | VARCHAR(255)              | Primary category                 |
| subcategory             | VARCHAR(255)              | Subcategory                      |
| transaction_type        | VARCHAR(50)               | Transaction type                 |
| name                    | VARCHAR(255)              | Transaction name/description     |
| merchant_name           | VARCHAR(255)              | Merchant name                    |
| amount                  | DECIMAL(12, 2) NOT NULL   | Transaction amount               |
| iso_currency_code       | VARCHAR(10) DEFAULT 'USD' | Currency code                    |
| date                    | DATE NOT NULL             | Transaction date                 |
| pending                 | BOOLEAN DEFAULT FALSE     | Whether transaction is pending   |
| account_owner           | VARCHAR(255)              | Owner of the account             |
| payment_channel         | VARCHAR(100)              | Payment channel                  |
| payment_method          | VARCHAR(100)              | Payment method                   |
| transaction_code        | VARCHAR(100)              | Transaction code                 |
| location                | JSONB                     | Location data                    |
| website                 | VARCHAR(255)              | Website of merchant              |
| authorized_date         | DATE                      | Date transaction was authorized  |
| authorized_datetime     | TIMESTAMP WITH TIME ZONE  | When transaction was authorized  |
| datetime                | TIMESTAMP WITH TIME ZONE  | Transaction datetime             |
| payment_meta            | JSONB                     | Payment metadata                 |
| personal_finance_category | JSONB                   | Personalized category data       |
| created_at              | TIMESTAMP WITH TIME ZONE  | When record was created          |
| updated_at              | TIMESTAMP WITH TIME ZONE  | When record was last updated     |

## Data Isolation and Security

Each table that contains user data includes a `user_id` column that references the Firebase Auth user ID. This ensures:

1. **Data isolation**: Each user can only access their own data
2. **Security**: Authentication is required for all data access
3. **Audit trail**: All data modifications are tied to specific users

## Working with the Database

### Schema Management

The application includes automatic schema management through the `schema-manager.js` utility. This handles:

1. Creating tables if they don't exist
2. Adding missing columns to existing tables
3. Tracking schema versions for each table
4. Providing a consistent interface for database operations

The schema manager is automatically used by API functions when they start, ensuring the database is always up-to-date with the latest schema.

### Direct Database Access

For debugging or administrative tasks, you can connect directly to the Neon Tech database:

1. Use the connection string from your environment variables
2. Connect using a PostgreSQL client like psql, pgAdmin, or a database GUI
3. Apply proper security practices when accessing the database directly

Example connection:
```bash
psql postgres://username:password@hostname.neon.tech/neondb?sslmode=require
```

### API Access to Data

All data access should go through the API endpoints, which ensure:

1. Proper authentication is applied
2. Data is filtered to show only the current user's information
3. Input validation is performed
4. Consistent error handling is maintained

## Data Backup and Recovery

Neon Tech PostgreSQL provides several features for data backup and recovery:

1. **Point-in-time recovery**: Restore the database to any point in time
2. **Automated backups**: Regular backups performed by Neon Tech
3. **Branching**: Create database branches for testing or development

For application-level backup, consider implementing an export feature that allows users to:
1. Export their financial data in CSV or JSON format
2. Backup specific data types (transactions, goals, salary entries)
3. Import previously exported data

## Future Schema Enhancements

Planned enhancements to the database schema include:

1. **Budget tracking**: Tables for budget categories, limits, and actual spending
2. **Investment tracking**: Tables for investment accounts, holdings, and performance
3. **Notification preferences**: User notification settings and history
4. **Report templates**: Saved report configurations and preferences
5. **Multi-currency support**: Enhanced schema to support multiple currencies

## Database Performance

For optimal database performance:

1. **Use indexes**: All primary keys and foreign keys are indexed
2. **Limit result sets**: Use LIMIT and OFFSET for pagination
3. **Use appropriate data types**: Choose the most efficient data type for each column
4. **Connection pooling**: Use the database connector utility for proper connection management

## Troubleshooting

If you encounter database issues:

1. **Check connectivity**: Use the `health-check.js` API endpoint
2. **Verify schema**: The `api-test.js` endpoint can verify table structure
3. **Check logs**: Database errors are logged to the Netlify function logs
4. **Check permissions**: Ensure your database user has appropriate permissions
5. **Validate data**: Ensure input data matches expected types and constraints 