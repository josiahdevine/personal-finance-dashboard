# Personal Finance Dashboard

<<<<<<< Updated upstream
A modern, secure, and user-friendly dashboard for managing personal finances, built with React, Node.js, and Plaid API integration.
=======
A comprehensive personal finance management application built with React, TypeScript, and modern web technologies. Features AI-powered financial insights, investment portfolio analysis, and cash flow predictions.
>>>>>>> Stashed changes

## 🌟 Features

<<<<<<< Updated upstream
- Secure bank account integration via Plaid
- Real-time transaction tracking
- Account balance monitoring
- Expense categorization
- Interactive financial charts and graphs
- Responsive design for mobile and desktop
=======
### Core Features
>>>>>>> Stashed changes

## 🏗️ Architecture

The application follows a modern microservices architecture:

- **Frontend**: React with TypeScript
- **Backend**: Node.js with Express
- **Database**: Neon Tech PostgreSQL
- **Authentication**: JWT-based auth
- **API Integration**: Plaid API for financial data

## 🚀 Quick Start

<<<<<<< Updated upstream
### Prerequisites

- Node.js (v16.0.0 or later)
- npm (v8.0.0 or later) or Yarn (v1.22.0 or later)
- PostgreSQL (Neon Tech DB)

### Installation
=======
### Advanced Features

5. **Cash Flow Prediction Engine**
   - Machine learning-based cash flow forecasting
   - Recurring transaction detection and analysis
   - Confidence interval calculations
   - What-if scenario analysis
   - Alert system for potential issues

6. **Investment Portfolio Analysis**
   - Real-time portfolio tracking and analysis
   - Asset allocation visualization
   - Sector analysis and diversification metrics
   - Performance tracking and benchmarking
   - Tax optimization recommendations
   - Risk metrics calculation (Sharpe ratio, beta, etc.)

7. **Security & Compliance**
   - Field-level encryption for sensitive data
   - Automatic key rotation system
   - Comprehensive audit logging
   - Role-based access control
   - Multi-factor authentication
>>>>>>> Stashed changes

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/personal-finance-dashboard.git
   cd personal-finance-dashboard
   ```

<<<<<<< Updated upstream
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
=======
8. **Financial Health Score System**
   - Component-based scoring algorithm
   - Personalized recommendations
   - Historical tracking
   - Peer comparison analytics
>>>>>>> Stashed changes

   **Important Notes:**
   - Never commit `.env` files containing sensitive information
   - Use environment-specific files (.env.development, .env.production, .env.test)
   - Keep `.env.example` updated with required variables but no sensitive values
   - See [Environment Setup Guide](./CODE-QUALITY.md#environment-configuration) for more details

<<<<<<< Updated upstream
4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```
=======
### Frontend
- **Core**: React 18+ with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API + Zustand
- **Data Visualization**: Recharts
- **Forms**: React Hook Form with Zod validation

### Backend
- **API**: Node.js with Express
- **Database**: Neon Tech DB (PostgreSQL)
- **ORM**: Prisma
- **Authentication**: Firebase Auth
- **Financial Data**: Plaid API

### Security
- **Encryption**: Web Crypto API
- **Key Management**: Custom key rotation system
- **Authentication**: JWT + Firebase
- **Authorization**: RBAC system
>>>>>>> Stashed changes

## 🧪 Testing

<<<<<<< Updated upstream
Run the test suite:
=======
```
src/
├── components/
│   ├── common/
│   │   ├── Card/
│   │   ├── Button/
│   │   ├── Input/
│   │   └── Select/
│   ├── features/
│   │   ├── cashFlow/
│   │   │   ├── CashFlowChart.tsx
│   │   │   ├── CashFlowAlerts.tsx
│   │   │   └── RecurringTransactions.tsx
│   │   ├── investment/
│   │   │   ├── PortfolioDashboard.tsx
│   │   │   ├── AssetAllocationChart.tsx
│   │   │   ├── SectorAllocationChart.tsx
│   │   │   └── HoldingsTable.tsx
│   │   └── salary/
│   ├── layout/
│   └── ui/
├── context/
├── hooks/
├── models/
├── pages/
│   ├── Dashboard/
│   ├── Investment/
│   └── CashFlow/
├── services/
│   ├── api/
│   ├── plaid/
│   └── analytics/
├── utils/
│   ├── encryption.ts
│   ├── keyRotation.ts
│   └── dateUtils.ts
└── tests/
    ├── security/
    ├── portfolio/
    └── cashFlow/
```
>>>>>>> Stashed changes

```bash
npm test
# or
yarn test
```

For integration tests with mocked database:
```bash
<<<<<<< Updated upstream
npm run test:integration
# or
yarn test:integration
=======
npm install
>>>>>>> Stashed changes
```

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Verify Neon Tech DB credentials
   - Check SSL mode configuration
   - Ensure proper network access
   - Review database metrics for error patterns
   - Check connection pool configuration

2. **Plaid Integration Issues**
   - Verify Plaid API credentials
   - Check environment setting (sandbox/development)
   - Review webhook configuration

3. **Test Suite Issues**
   - Ensure correct Chai version (use v4.3.4)
   - Check JWT token configuration
   - Verify database mocking setup

<<<<<<< Updated upstream
## 📚 Documentation

- [Plaid Integration Guide](./documentation/plaid-implementation.md)
- [Test Setup Guide](./TEST-SETUP.md)
- [Database Schema](./DATABASE-SCHEMA.md)
- [API Documentation](./documentation/api-docs.md)
- [Neon DB Improvements](./NEON-DB-IMPROVEMENTS.md)

## 🔐 Security

- JWT-based authentication
- Encrypted database credentials
- Secure token management
- Rate limiting
- XSS protection
- CORS configuration

## 🛠️ Database Features

### Neon Tech PostgreSQL Integration

The application uses Neon Tech PostgreSQL as its primary database with several advanced features:
=======
3. **Security**
   - Use field-level encryption for sensitive data
   - Implement proper key rotation
   - Follow security best practices

4. **Testing**
   - Write unit tests for all critical functions
   - Implement integration tests for features
   - Test security measures thoroughly

## Pending Tasks

1. **Testing Implementation**
   - Run encryption system tests
   - Execute key rotation tests
   - Complete portfolio analysis tests
   - Implement end-to-end tests

2. **Production Verification**
   - Run security verification in production
   - Test key rotation in production
   - Verify encryption performance

3. **Documentation**
   - Update API documentation
   - Document security procedures
   - Add deployment guides
>>>>>>> Stashed changes

- **Connection Pooling**: Optimized connection management for better performance
- **Query Monitoring**: Comprehensive tracking of query performance and errors
- **Automatic Optimization**: Analysis and suggestions for query improvements
- **Backup System**: Automated backup and restore functionality
- **Error Handling**: Robust error handling with retry mechanisms

<<<<<<< Updated upstream
For more details, see the [Neon DB Improvements](./NEON-DB-IMPROVEMENTS.md) documentation.
=======
Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting any changes.
>>>>>>> Stashed changes

## 📝 License

<<<<<<< Updated upstream
MIT License - see LICENSE file for details
=======
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
>>>>>>> Stashed changes
