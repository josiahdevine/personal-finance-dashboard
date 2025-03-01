# Personal Finance Dashboard

A modern, secure, and user-friendly dashboard for managing personal finances, built with React, Node.js, and Plaid API integration.

## 🌟 Features

- Secure bank account integration via Plaid
- Real-time transaction tracking
- Account balance monitoring
- Expense categorization
- Interactive financial charts and graphs
- Responsive design for mobile and desktop

## 🏗️ Architecture

The application follows a modern microservices architecture:

- **Frontend**: React with TypeScript
- **Backend**: Node.js with Express
- **Database**: Neon Tech PostgreSQL
- **Authentication**: JWT-based auth
- **API Integration**: Plaid API for financial data

## 🚀 Quick Start

### Prerequisites

- Node.js (v16.0.0 or later)
- npm (v8.0.0 or later) or Yarn (v1.22.0 or later)
- PostgreSQL (Neon Tech DB)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/personal-finance-dashboard.git
   cd personal-finance-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Copy `.env.example` to create the appropriate environment file:
   ```bash
   # For development
   cp .env.example .env.development
   # For production
   cp .env.example .env.production
   # For testing
   cp .env.example .env.test
   ```

   Each environment file should contain:
   ```env
   # Database Configuration (Neon Tech)
   DATABASE_URL=your_neon_db_url
   PGUSER=your_db_user
   PGPASSWORD=your_db_password
   PGDATABASE=your_db_name
   PGHOST=your_db_host
   PGPORT=5432
   PGSSLMODE=require

   # Plaid API Configuration
   PLAID_CLIENT_ID=your_plaid_client_id
   PLAID_SECRET=your_plaid_secret
   PLAID_ENV=sandbox # or development/production based on environment
   
   # Security Configuration
   JWT_SECRET=your_jwt_secret
   ENCRYPTION_MASTER_KEY=your_32_char_encryption_key
   ```

   **Important Notes:**
   - Never commit `.env` files containing sensitive information
   - Use environment-specific files (.env.development, .env.production, .env.test)
   - Keep `.env.example` updated with required variables but no sensitive values
   - See [Environment Setup Guide](./CODE-QUALITY.md#environment-configuration) for more details

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## 🧪 Testing

Run the test suite:

```bash
npm test
# or
yarn test
```

For integration tests with mocked database:
```bash
npm run test:integration
# or
yarn test:integration
```

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Verify Neon Tech DB credentials
   - Check SSL mode configuration
   - Ensure proper network access

2. **Plaid Integration Issues**
   - Verify Plaid API credentials
   - Check environment setting (sandbox/development)
   - Review webhook configuration

3. **Test Suite Issues**
   - Ensure correct Chai version (use v4.3.4)
   - Check JWT token configuration
   - Verify database mocking setup

## 📚 Documentation

- [Plaid Integration Guide](./documentation/plaid-implementation.md)
- [Test Setup Guide](./TEST-SETUP.md)
- [Database Schema](./documentation/database-schema.md)
- [API Documentation](./documentation/api-docs.md)

## 🔐 Security

- JWT-based authentication
- Encrypted database credentials
- Secure token management
- Rate limiting
- XSS protection
- CORS configuration

## 📝 License

MIT License - see LICENSE file for details
