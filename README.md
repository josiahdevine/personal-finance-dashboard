# Personal Finance Dashboard

A comprehensive personal finance management application built with React, TypeScript, and modern web technologies. Features AI-powered financial insights, investment portfolio analysis, and cash flow predictions.

## Features

### Core Features

1. **Dashboard Overview**
   - Interactive dashboard with real-time data visualization
   - Quick access applets for all financial modules
   - Net worth tracker with asset/liability breakdown
   - Transaction summary and recent activity

2. **Bills & Subscriptions**
   - AI-powered bill categorization and analysis
   - Automated recurring expense detection
   - Payment status tracking with due date alerts
   - Subscription cost optimization suggestions

3. **Salary Journal**
   - Interactive income tracking with visual charts
   - Comprehensive salary history with filtering
   - Benefits and bonus tracking with analytics
   - Year-over-year growth visualization

4. **Net Worth Tracker**
   - Real-time asset and liability tracking
   - Historical net worth trends
   - Asset category breakdown
   - Monthly change analysis

5. **Budget Planning**
   - Interactive budget allocation with charts
   - Category-based spending analysis
   - Real-time progress tracking
   - Visual budget vs. actual comparison

6. **Profile Management**
   - User account settings and preferences
   - Notification management
   - Subscription plan details
   - Security and privacy controls

7. **Authentication System**
   - Firebase Authentication integration
   - Email/password authentication
   - Google OAuth sign-in
   - Secure session management

### Advanced Features

8. **Cash Flow Prediction Engine**
   - Machine learning-based cash flow forecasting
   - Recurring transaction detection and analysis
   - Confidence interval calculations
   - What-if scenario analysis
   - Alert system for potential issues

9. **Investment Portfolio Analysis**
   - Real-time portfolio tracking and analysis
   - Asset allocation visualization
   - Sector analysis and diversification metrics
   - Performance tracking and benchmarking
   - Tax optimization recommendations
   - Risk metrics calculation (Sharpe ratio, beta, etc.)

10. **Security & Compliance**
    - Field-level encryption for sensitive data
    - Automatic key rotation system
    - Comprehensive audit logging
    - Role-based access control
    - Multi-factor authentication

### Planned Features

1. **Transaction Analytics**
   - Enhanced transaction categorization
   - AI-powered spending insights
   - Custom transaction rules
   - Merchant analysis

2. **Financial Goals**
   - Goal setting and tracking
   - Progress monitoring
   - Timeline projections
   - Achievement celebrations

3. **Investment Portfolio**
   - Stock/ETF/Crypto tracking
   - Performance monitoring
   - Portfolio diversification
   - Real-time market data

4. **Mobile Optimization**
   - Responsive design improvements
   - Touch-friendly interfaces
   - Mobile-specific features
   - PWA capabilities

## Project Organization

### Documentation

All project documentation is maintained in the `/docs` directory structure. See [Documentation Guidelines](/docs/README.md) for more details on our documentation organization.

Key documentation areas:
- [API Documentation](/docs/api/)
- [Component Documentation](/docs/components/)
- [Database Schema and Migrations](/docs/database/)
- [Development Guidelines](/docs/development/)
- [Integration Guides](/docs/integrations/)

### Database Migrations

All database migrations are centralized in the `/migrations` directory with the following structure:
- `/migrations/sql/`: Contains all SQL migration files
- `/migrations/scripts/`: Contains migration execution scripts

To run all migrations:
```bash
node migrations/scripts/run-all-migrations.js
```

See [Database Migrations Guide](/docs/database/migrations/README.md) for detailed information.

### Component Organization

UI components follow a structured organization:
- All shadcn/ui components are located in `src/components/ui/`
- Layout components are in `src/components/layout/`
- Feature-specific components are organized by feature area

### Type System

The project uses a comprehensive type system with:
- Strong typing for all domain objects
- Type guards and validation utilities
- Standardized type definitions for API responses

## Technology Stack

### Frontend
- **Core**: React 18+ with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API + Zustand
- **Data Visualization**: Recharts, Chart.js
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

## Project Structure

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

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- PostgreSQL database
- Plaid API credentials
- Firebase project credentials

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
   ```bash
   # Create a .env file and add the following:
   
   # Database Configuration
   DATABASE_URL=your_database_url
   
   # Plaid API Configuration
   PLAID_CLIENT_ID=your_plaid_client_id
   PLAID_SECRET=your_plaid_secret
   PLAID_ENV=sandbox # or development/production
   
   # Firebase Configuration
   FIREBASE_API_KEY=your_firebase_api_key
   FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   FIREBASE_PROJECT_ID=your_firebase_project_id
   
   # Security Configuration
   JWT_SECRET=your_jwt_secret
   ENCRYPTION_MASTER_KEY=your_32_char_encryption_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## Testing

Run the test suite:
```bash
npm test
# or
yarn test
```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
