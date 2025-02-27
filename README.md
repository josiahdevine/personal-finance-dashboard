# Personal Finance Dashboard

A comprehensive web application for managing personal finances, tracking net worth, and analyzing spending patterns. Built with React, Node.js, and PostgreSQL.

## Features

- **Net Worth Tracking**
  - Connect bank accounts via Plaid API
  - Manual account entry support
  - Historical net worth visualization
  - Asset and liability management

- **Income Management**
  - Salary tracking with tax calculations
  - Support for multiple income sources
  - Automatic paycheck calculations
  - RSU/Stock compensation tracking

- **Expense Analysis**
  - Transaction categorization
  - Spending trends visualization
  - Bill tracking and analysis
  - CSV import support

- **Financial Goals**
  - Goal setting and tracking
  - Progress visualization
  - Category-based organization

## Important Notes

### US-Only Functionality
The Personal Finance Dashboard is currently designed for US users only:
- Financial calculations are based on US tax regulations
- Plaid integration is configured for US financial institutions
- Currency is fixed to USD with no multi-currency support
- Date formats follow US conventions (MM/DD/YYYY)

Support for additional countries may be added in future versions.

### Demo Environment
A fully-featured interactive demo environment is currently in development to showcase the application's capabilities without requiring account creation. This will include:
- Sample data with realistic financial patterns
- All major features accessible with pre-populated data
- No need to connect real financial accounts
- Guided tour of key functionality

Check back soon for the demo launch!

## Known Issues & Roadmap

### Current Issues
We are actively working on resolving the following known issues:

1. **Ask AI Authentication Issue**  
   Users may experience automatic logout when using the Ask AI feature. This is a known issue we're actively fixing.

2. **API Integration Inconsistencies**  
   Some API endpoints may return inconsistent responses. We recommend refreshing or trying again if you encounter errors.

3. **Mobile Experience Limitations**  
   While the application is responsive, some features are still being optimized for mobile devices. See our [Mobile Roadmap](MOBILE-ROADMAP.md) for details.

### Development Documentation
For developers interested in the project's roadmap and technical details:

- [Development Changelog](DEVELOPMENT-CHANGELOG.md) - Comprehensive history of changes and implementations
- [Database Schema](DATABASE-SCHEMA.md) - Detailed information about the database structure
- [Mobile Roadmap](MOBILE-ROADMAP.md) - Plans and priorities for mobile optimization

### Future Features
Upcoming features in development:
- Coinbase API integration for cryptocurrency tracking
- Improved data visualization with custom chart components
- Enhanced financial planning tools with AI-assisted recommendations
- Progressive Web App (PWA) support for offline functionality

## Tech Stack

- **Frontend**: React, Tailwind CSS, Chart.js
- **Backend**: Node.js, Express
- **Database**: PostgreSQL (Neon Tech)
- **APIs**: Plaid Integration
- **Authentication**: Firebase Auth
- **Deployment**: Netlify

## Getting Started

1. Clone the repository
```bash
git clone [repository-url]
cd personal-finance-dashboard
```

2. Install dependencies
```bash
npm install
cd functions
npm install
cd ..
```

3. Set up environment variables
Create a `.env` file in the root directory with:
```
REACT_APP_API_URL=your_api_url
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret
PLAID_ENV=sandbox
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
DATABASE_URL=postgres://username:password@hostname.neon.tech/neondb?sslmode=require
```

4. Start the development server
```bash
npm start
```

## Environment Setup

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL
- Plaid Developer Account
- Firebase Account

### Database Setup
1. Create a PostgreSQL database on [Neon Tech](https://neon.tech/)
2. Set your database connection string in `.env`:
```
DATABASE_URL=postgres://username:password@hostname.neon.tech/neondb?sslmode=require
```
3. Database tables will be automatically created and migrated when the application first connects

### Firebase Auth Setup
1. Create a new Firebase project
2. Enable Firebase Authentication with email/password
3. Set up Firebase Admin SDK credentials
4. Update environment variables with Firebase configuration

## API Security

All API endpoints are protected with Firebase authentication. To access protected endpoints:
1. Authenticate with Firebase to receive a token
2. Include the token in requests using the Authorization header:
```
Authorization: Bearer <firebase-id-token>
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Plaid API for financial account integration
- Chart.js for data visualization
- Tailwind CSS for styling
- Firebase for authentication
- Netlify for serverless functions and hosting
