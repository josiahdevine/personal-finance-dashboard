# Personal Finance Dashboard API Documentation

## Overview

This document provides detailed information about the Personal Finance Dashboard API endpoints, including authentication, request/response formats, and error handling.

## Base URL

```
Development: http://localhost:5000/api
Production: https://api.yourapp.com/api
```

## Authentication

All API endpoints require JWT authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### Plaid Integration

#### 1. Create Link Token

Creates a Plaid Link token for initializing the Plaid Link flow.

```
POST /plaid/create-link-token
```

**Request:**
```json
{
  "client_name": "Personal Finance Dashboard",
  "products": ["transactions"],
  "country_codes": ["US"],
  "language": "en"
}
```

**Response:**
```json
{
  "link_token": "link-sandbox-123...",
  "expiration": "2024-12-31T23:59:59Z"
}
```

#### 2. Exchange Public Token

Exchanges a public token for an access token.

```
POST /plaid/exchange-token
```

**Request:**
```json
{
  "public_token": "public-sandbox-123..."
}
```

**Response:**
```json
{
  "success": true,
  "item_id": "item_123...",
  "access_token": "access-sandbox-123..." // Note: Only returned in development
}
```

#### 3. Sync Transactions

Syncs transactions for a connected account.

```
POST /plaid/sync-transactions
```

**Request:**
```json
{
  "access_token": "access-sandbox-123...",
  "cursor": "1234567890" // Optional
}
```

**Response:**
```json
{
  "added": [
    {
      "transaction_id": "tx_123...",
      "amount": 100.00,
      "date": "2024-03-15",
      "merchant_name": "Example Store",
      "category": ["Shopping"]
    }
  ],
  "modified": [],
  "removed": [],
  "has_more": false,
  "next_cursor": "1234567891"
}
```

#### 4. Get Account Balances

Retrieves current balances for all connected accounts.

```
GET /plaid/balances
```

**Response:**
```json
{
  "accounts": [
    {
      "account_id": "acc_123...",
      "balances": {
        "current": 1000.00,
        "available": 900.00,
        "limit": null
      },
      "mask": "1234",
      "name": "Checking Account",
      "type": "depository"
    }
  ]
}
```

#### 5. Webhook Endpoint

Receives webhooks from Plaid.

```
POST /plaid/webhook
```

**Request:**
```json
{
  "webhook_type": "TRANSACTIONS",
  "webhook_code": "SYNC_UPDATES_AVAILABLE",
  "item_id": "item_123...",
  "error": null
}
```

**Response:**
```json
{
  "status": "success"
}
```

### Account Management

#### 1. Get User Accounts

Retrieves all accounts for the authenticated user.

```
GET /accounts
```

**Response:**
```json
{
  "accounts": [
    {
      "id": "acc_123...",
      "name": "Chase Checking",
      "type": "checking",
      "balance": 1000.00,
      "institution": {
        "name": "Chase",
        "logo": "https://..."
      }
    }
  ]
}
```

#### 2. Update Account Settings

Updates settings for a specific account.

```
PATCH /accounts/:accountId
```

**Request:**
```json
{
  "name": "New Account Name",
  "hidden": false
}
```

**Response:**
```json
{
  "success": true,
  "account": {
    "id": "acc_123...",
    "name": "New Account Name",
    "hidden": false
  }
}
```

### Transaction Management

#### 1. Get Transactions

Retrieves transactions with optional filtering.

```
GET /transactions
```

**Query Parameters:**
- `start_date`: ISO date string (required)
- `end_date`: ISO date string (required)
- `account_id`: string (optional)
- `category`: string (optional)
- `limit`: number (optional, default: 100)
- `offset`: number (optional, default: 0)

**Response:**
```json
{
  "transactions": [
    {
      "id": "tx_123...",
      "date": "2024-03-15",
      "amount": 50.00,
      "description": "Coffee Shop",
      "category": "Food and Drink",
      "account_id": "acc_123..."
    }
  ],
  "total_count": 150,
  "has_more": true
}
```

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The request was invalid",
    "details": {
      "field": "public_token",
      "issue": "Token has expired"
    }
  }
}
```

### Common Error Codes

- `UNAUTHORIZED`: Missing or invalid JWT token
- `INVALID_REQUEST`: Malformed request or invalid parameters
- `PLAID_ERROR`: Error from Plaid API
- `DATABASE_ERROR`: Database operation failed
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Unexpected server error

### HTTP Status Codes

- `200`: Success
- `201`: Resource created
- `400`: Bad request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Resource not found
- `429`: Rate limit exceeded
- `500`: Internal server error

## Rate Limiting

- Rate limit: 100 requests per minute per user
- Rate limit headers included in response:
  ```
  X-RateLimit-Limit: 100
  X-RateLimit-Remaining: 95
  X-RateLimit-Reset: 1234567890
  ```

## Webhooks

### Webhook Verification

Plaid webhooks include a verification header:
```
Plaid-Verification: webhook_key.1234567890.signature
```

### Webhook Types

1. **TRANSACTIONS**
   - `SYNC_UPDATES_AVAILABLE`: New transactions available
   - `TRANSACTIONS_REMOVED`: Transactions deleted

2. **ITEM**
   - `ERROR`: Item error occurred
   - `PENDING_EXPIRATION`: Access token expiring soon

3. **AUTH**
   - `AUTOMATICALLY_VERIFIED`: Account numbers verified
   - `VERIFICATION_EXPIRED`: Account verification expired

## Development Tools

### Testing Tools

1. **Postman Collection**
   - Download: [personal-finance-api.postman_collection.json](link-to-collection)
   - Environment variables template included

2. **Curl Examples**
   ```bash
   # Create link token
   curl -X POST http://localhost:5000/api/plaid/create-link-token \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json"
   ```

### Sandbox Testing

1. **Test Credentials**
   - Username: `user_good`
   - Password: `pass_good`
   - MFA Code: `1234`

2. **Test Institution**
   - ID: `ins_109508`
   - Name: "First Platypus Bank" 