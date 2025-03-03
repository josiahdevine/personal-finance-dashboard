# API Documentation

## Overview
The Personal Finance Dashboard API provides endpoints for managing financial data, user authentication, and integration with third-party services like Plaid.

## Base URL
- Development: `http://localhost:3000/api`
- Production: `https://your-domain.com/api`

## Authentication
All API endpoints require authentication using Firebase JWT tokens.

```http
Authorization: Bearer <firebase_token>
```

## Endpoints

### User Management

#### Get User Profile
```http
GET /api/users/profile
```

Response:
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "displayName": "John Doe",
  "createdAt": "2024-03-03T00:00:00Z"
}
```

### Financial Data

#### Get Transactions
```http
GET /api/transactions
```

Query Parameters:
- `startDate`: ISO date string
- `endDate`: ISO date string
- `category`: string
- `limit`: number
- `offset`: number

Response:
```json
{
  "transactions": [
    {
      "id": "tx_id",
      "amount": 50.00,
      "description": "Coffee Shop",
      "category": "Food & Drink",
      "date": "2024-03-03T00:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "pageSize": 20
}
```

### Plaid Integration

#### Link Bank Account
```http
POST /api/plaid/link
```

Request:
```json
{
  "publicToken": "plaid_public_token",
  "accountIds": ["account_id"]
}
```

Response:
```json
{
  "success": true,
  "accessToken": "access_token",
  "itemId": "item_id"
}
```

## Error Handling

### Error Response Format
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  }
}
```

### Common Error Codes
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid request data
- `INTERNAL_ERROR`: Server error

## Rate Limiting
- 100 requests per minute per user
- 1000 requests per day per user

## Webhooks

### Plaid Webhooks
```http
POST /api/webhooks/plaid
```

Supported Events:
- `TRANSACTIONS_SYNC`
- `ITEM_ERROR`
- `DEFAULT_UPDATE`

## Development Guidelines

### API Versioning
- Version included in URL path: `/api/v1/`
- Current version: v1
- Deprecation notice provided 6 months in advance

### Request/Response Headers
```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer <token>
```

### Testing
- Test environment: `http://localhost:3000/api`
- Test accounts available in development
- Postman collection provided

## Security

### Authentication
- Firebase JWT required
- Tokens expire after 1 hour
- Refresh tokens handled automatically

### Data Protection
- All data encrypted in transit (HTTPS)
- Sensitive data encrypted at rest
- PII handled according to GDPR/CCPA

## Integration Examples

### JavaScript/TypeScript
```typescript
const api = {
  baseURL: 'http://localhost:3000/api',
  async getTransactions(startDate, endDate) {
    const response = await fetch(`${this.baseURL}/transactions?startDate=${startDate}&endDate=${endDate}`, {
      headers: {
        'Authorization': `Bearer ${await getFirebaseToken()}`
      }
    });
    return response.json();
  }
};
```

### Python
```python
import requests

def get_transactions(token, start_date, end_date):
    response = requests.get(
        'http://localhost:3000/api/transactions',
        headers={'Authorization': f'Bearer {token}'},
        params={'startDate': start_date, 'endDate': end_date}
    )
    return response.json()
```

## Best Practices

1. Always validate input data
2. Use appropriate HTTP methods
3. Include error handling
4. Implement rate limiting
5. Log API usage
6. Monitor performance
7. Document changes
8. Test thoroughly
9. Handle timeouts
10. Implement caching

## Support

- GitHub Issues: [Link to Issues]
- Email: support@example.com
- Documentation Updates: Weekly
- Status Page: [Link to Status] 