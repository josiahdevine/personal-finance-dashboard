# Personal Finance Dashboard - Test Setup

This document provides instructions for setting up and running the Personal Finance Dashboard application on your local development environment.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later) or Yarn (v1.22.0 or later)
- Git

## Getting Started

Follow these steps to set up the project locally:

1. **Clone the repository**:
   ```
   git clone https://github.com/yourusername/personal-finance-dashboard.git
   cd personal-finance-dashboard
   ```

2. **Install dependencies**:
   ```
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory with the following variables:
   ```
   REACT_APP_API_URL=http://localhost:5000
   REACT_APP_PLAID_ENV=sandbox
   REACT_APP_PLAID_CLIENT_ID=your_plaid_client_id
   REACT_APP_PLAID_SECRET=your_plaid_secret
   REACT_APP_PLAID_PUBLIC_KEY=your_plaid_public_key
   REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   REACT_APP_FIREBASE_APP_ID=your_firebase_app_id
   ```

   Note: For development, you can use the Plaid sandbox environment. Sign up for a [Plaid developer account](https://dashboard.plaid.com/signup) to get your API keys.

4. **Run the development server**:
   ```
   npm start
   # or
   yarn start
   ```

5. **Access the application**:
   Open your browser and navigate to `http://localhost:3000`

## Development Mode Features

When running in development mode, the application provides several features to aid in testing:

### Mock Data

The dashboard includes sample data for testing purposes when running in development mode:

- Sample accounts and balances
- Mock transactions with various categories
- Test budget information
- Simulated financial trends

### Testing Plaid Integration

To test the Plaid integration in development:

1. In the dashboard, navigate to the "Link Accounts" section
2. Click on "Connect an Account"
3. Use the following test credentials:
   - Username: `user_good`
   - Password: `pass_good`
4. Select any institution for testing purposes

### Simulating Different User States

The application includes several simulated user states for testing:

1. **New User**:
   - Clear your localStorage by running `localStorage.clear()` in the browser console
   - Refresh the page to see the onboarding flow

2. **User with Accounts**:
   - Default development state
   - Shows sample connected accounts and data

3. **Error States**:
   - Add `?simulateError=true` to any URL to test error handling
   - Example: `http://localhost:3000/dashboard?simulateError=true`

## Running Tests

The project includes several types of tests:

1. **Unit tests**:
   ```
   npm test
   # or
   yarn test
   ```

2. **End-to-end tests**:
   ```
   npm run test:e2e
   # or
   yarn test:e2e
   ```

3. **Component tests with Storybook**:
   ```
   npm run storybook
   # or
   yarn storybook
   ```
   Then open your browser to `http://localhost:6006`

## Troubleshooting

### Common Issues

1. **API Connection Issues**:
   - Verify your `.env` file contains the correct API URLs and credentials
   - Check that your Plaid API keys are valid and have the necessary permissions

2. **Build Failures**:
   - Ensure you have the correct Node.js version installed
   - Try deleting `node_modules` and reinstalling dependencies:
     ```
     rm -rf node_modules
     npm install
     # or
     yarn install
     ```

3. **React Router Issues**:
   - If routes aren't working correctly, check that your browser supports modern JavaScript features
   - Verify that the router configuration in `App.js` matches your expected routes

### Getting Help

If you encounter any issues not covered here, please:

1. Check the existing issues in the GitHub repository
2. Open a new issue with detailed information about your problem
3. Contact the development team at dev@financeapp.example.com

## Contributing

We welcome contributions to the Personal Finance Dashboard! Please see the `CONTRIBUTING.md` file for guidelines on how to contribute.

## License

This project is licensed under the MIT License - see the `LICENSE` file for details. 