# Personal Finance Dashboard - Project Documentation

## Project Overview

The Personal Finance Dashboard is a comprehensive web application designed to help users track, manage, and optimize their personal finances. The application integrates with banking services via Plaid, provides subscription management, analyzes spending patterns, and offers AI-powered financial advice.

**Primary Goals:**
- Provide users with a unified view of their financial accounts and transactions
- Enable budget tracking and financial goal setting
- Offer insights into spending habits and financial health
- Facilitate subscription management and bill tracking
- Create a responsive experience that works well on both desktop and mobile devices

## Tech Stack

### Frontend
- **Framework**: React.js with functional components and hooks
- **Styling**: Tailwind CSS for utility-first styling
- **State Management**: React Context API (AuthContext, PlaidContext, FinanceDataContext)
- **Routing**: React Router v6
- **Forms**: Formik with Yup validation
- **Data Visualization**: Chart.js / React-Chartjs-2
- **Notifications**: React-Toastify

### Backend/Services
- **Authentication**: Firebase Authentication
- **Database**: PostgreSQL hosted on Neon Tech 
- **Banking Integration**: Plaid API
- **Payment Processing**: Stripe
- **AI Insights**: Google Gemini API

### Deployment
- **Hosting**: Netlify (previously on Vercel)
- **Domain**: trypersonalfinance.com
- **CI/CD**: Netlify auto-deploy from GitHub

## Directory Structure

```
personal-finance-dashboard/
├── public/             # Static assets and index.html with CSP
├── src/
│   ├── Components/     # Reusable UI components
│   │   ├── auth/       # Authentication-related components
│   │   └── ...         # Feature-specific components
│   ├── contexts/       # React Context providers
│   ├── mobile/         # Mobile-specific components
│   ├── pages/          # Page-level components
│   ├── services/       # API services and external integrations
│   ├── utils/          # Utility functions and helpers
│   ├── App.js          # Main application component
│   └── index.js        # Entry point
├── .env.production     # Production environment variables
├── .env.development    # Development environment variables
├── netlify.toml        # Netlify configuration
└── package.json        # Dependencies and scripts
```

## Key Features

### 1. Authentication
- Email/password authentication via Firebase
- Persistent sessions with local storage
- Protected routes with authentication state tracking

### 2. Financial Account Connections
- Plaid integration for connecting bank accounts
- Transaction data retrieval and categorization
- Balance tracking and history

### 3. Dashboard
- Overview of financial health
- Account balances
- Recent transactions
- Spending summaries
- Financial goals progress

### 4. Transaction Management
- List and filter transactions
- Categorize and tag transactions
- Search functionality
- Export capabilities

### 5. Salary Journal
- Track income sources
- Tax calculations
- Income trends analysis

### 6. Bills Analysis
- Track recurring expenses
- Bill payment reminders
- Expense categorization

### 7. Financial Goals
- Create and track savings goals
- Progress visualization
- Goal completion forecasting

### 8. AI-Powered Financial Advice
- Natural language interface for financial questions
- Personalized insights based on transaction data
- Spending optimization suggestions

### 9. Subscription Management
- Track subscription services
- Renewal reminders
- Cost optimization suggestions

### 10. Mobile Responsiveness
- Adaptive layouts for different screen sizes
- Mobile-specific components for better UX

## Core Integrations

### 1. Firebase Authentication
- **Configuration**: Located in `src/services/firebase.js`
- **Auth Context**: Manages authentication state in `src/contexts/AuthContext.js`
- **Features**: Email/password auth, session persistence, error handling

### 2. Plaid API Integration
- **Configuration**: Environment variables for API keys
- **Plaid Context**: Manages Plaid connection in `src/contexts/PlaidContext.js`
- **Link Component**: Handles account linking in `src/Components/LinkAccounts.js`
- **Transaction Syncing**: Retrieves and processes transaction data

### 3. Stripe Payment Processing
- **Configuration**: Stripe publishable key in environment variables
- **Subscription Management**: Handles plans and payments
- **Components**: Implementation in `src/Components/SubscriptionPlans.js`

### 4. Google Gemini AI Integration
- **Configuration**: API key in environment variables
- **Implementation**: AI assistance in `src/Components/AskAI.js`
- **Features**: Natural language processing for financial advice

## Deployment Details

### Hosting Environment
- **Platform**: Netlify
- **URL**: https://trypersonalfinance.com
- **Netlify Site Name**: willowy-choux-870c3b

### Environment Variables
- Stored in `.env.production` for production builds
- Sensitive keys managed through Netlify environment variables

### Build Process
- **Build Command**: `npm run build`
- **Publish Directory**: `build/`
- **Node Version**: 16.x

### Domain Configuration
- Custom domain: trypersonalfinance.com
- HTTPS enabled with automatic certificate management
- DNS configuration required for proper resolution

## Persistent Issues and Solutions

### 1. Firebase Authentication Domain Issues
- **Problem**: Authentication failures with custom domain
- **Solution**: 
  - Added custom domain to Firebase authorized domains
  - Ensured correct authDomain configuration in code
  - Implemented platform migration utilities for smooth transition from Vercel to Netlify

### 2. Content Security Policy Restrictions
- **Problem**: Third-party scripts and connections blocked by CSP
- **Solution**: 
  - Carefully configured CSP directives in `public/index.html`
  - Added necessary domains for Firebase, Plaid, Stripe, and Google APIs

### 3. Plaid API Sandbox Limitations
- **Problem**: Limited transaction data in sandbox environment
- **Solution**: 
  - Implemented mock data generation for development
  - Added fallback UI for when Plaid connections aren't available

### 4. Mobile Responsiveness Challenges
- **Problem**: Complex dashboard layouts difficult to adapt for mobile
- **Solution**:
  - Created mobile-specific components for key features
  - Used responsive layout components with screen size detection

### 5. DNS Configuration Issues
- **Problem**: DNS_PROBE_FINISHED_NXDOMAIN errors with custom domain
- **Solution**:
  - Required proper DNS configuration at registrar
  - Needed to verify and update DNS records to point to Netlify

## Recent Migrations

### Vercel to Netlify Migration
- Completed transition from Vercel to Netlify hosting
- Updated build configuration in netlify.toml
- Modified authentication settings to work with new domain
- Added migration utilities to handle user transitions

### Authentication Improvements
- Enhanced error handling for auth failures
- Added detailed logging for troubleshooting
- Implemented platform-aware authentication flows
- Added version tracking for authentication state

## Current Development Goals

### Short-term
1. Resolve DNS configuration issues
2. Enhance mobile experience for core features
3. Improve error handling for third-party integrations
4. Add comprehensive user onboarding flow

### Mid-term
1. Implement subscription payment processing
2. Enhance AI financial advice capabilities
3. Add advanced transaction categorization
4. Develop budgeting features

### Long-term
1. Build financial forecasting capabilities
2. Implement investment tracking and analysis
3. Develop tax planning features
4. Create export/import functionality for financial data

## Developing Locally

### Setup Instructions
1. Clone the repository
2. Run `npm install` to install dependencies
3. Create `.env.development` with required environment variables
4. Run `npm start` to start the development server

### Required Environment Variables
- Firebase configuration (API Key, Auth Domain, etc.)
- Plaid API credentials
- Stripe publishable key
- Google Gemini API key

### Testing
- Currently using manual testing
- Plan to implement Jest/React Testing Library for unit tests
- Need to add end-to-end testing with Cypress

## Resources and References

### API Documentation
- [Plaid API Documentation](https://plaid.com/docs/)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Stripe API](https://stripe.com/docs/api)
- [Google Gemini API](https://ai.google.dev/docs)

### Design References
- Figma designs for UI components (link TBD)
- Brand guidelines document (link TBD)

### Development Guidelines
- Use functional components with hooks
- Follow Tailwind best practices
- Implement proper error handling for all API calls
- Maintain responsive design for all components 