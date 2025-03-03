# Deployment Guide

This guide covers the process of deploying the Personal Finance Dashboard to Netlify.

## Prerequisites

1. A Netlify account
2. Git repository connected to Netlify
3. All environment variables configured
4. Firebase and Plaid accounts set up

## Environment Variables

Before deploying, ensure all required environment variables are set in your Netlify dashboard:

1. Go to Site settings > Build & deploy > Environment
2. Add all variables from your `.env` file, including:
   - Firebase configuration
   - Stripe configuration
   - Plaid configuration
   - API URLs and secrets
3. Ensure sensitive values are properly secured

### Critical Environment Variables

```plaintext
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Stripe Configuration
REACT_APP_STRIPE_PUBLISHABLE_KEY=your_publishable_key
REACT_APP_STRIPE_SECRET_KEY=your_secret_key

# Plaid Configuration
REACT_APP_PLAID_CLIENT_ID=your_client_id
REACT_APP_PLAID_SECRET=your_secret
REACT_APP_PLAID_ENV=sandbox  # Or development, production
```

## Build Configuration

The project uses the following build settings in Netlify:

```toml
[build]
  command = "npm run build"
  publish = "build"
  functions = "functions"

[build.environment]
  NODE_VERSION = "16"
  NPM_VERSION = "8"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## Deployment Steps

### 1. Local Testing

Before deploying, test the production build locally:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build the project
npm run build

# Test the build locally
netlify dev
```

### 2. Automated Deployment

The easiest way to deploy is through Git:

1. Commit all changes
2. Push to your connected repository
3. Netlify will automatically detect changes and deploy

### 3. Manual Deployment

If needed, you can deploy manually:

```bash
# Deploy to Netlify
netlify deploy --prod
```

## Post-Deployment Checklist

- [ ] Verify all environment variables are set
- [ ] Test authentication flow
  - [ ] Email/Password login
  - [ ] Google Sign-in
  - [ ] Registration
- [ ] Confirm Plaid integration works
- [ ] Test Stripe integration
  - [ ] Subscription creation
  - [ ] Payment processing
- [ ] Check database connections
- [ ] Verify API endpoints are accessible
- [ ] Test all major features
- [ ] Monitor error logging

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check build logs in Netlify dashboard
   - Verify Node.js version compatibility
   - Ensure all dependencies are properly installed

2. **Authentication Issues**
   - Verify Firebase configuration in environment variables
   - Check authorized domains in Firebase Console
   - Ensure Firebase initialization is working (check browser console)
   - Verify auth persistence settings
   - Check CORS configuration for API endpoints

3. **Stripe Integration Issues**
   - Verify Stripe publishable key is correctly set
   - Check Stripe initialization in browser console
   - Ensure webhook endpoints are properly configured
   - Test payment flow in test mode

4. **API Connection Problems**
   - Verify API URL configuration
   - Check CORS settings
   - Confirm API is accessible from Netlify's servers
   - Verify authentication tokens are being passed correctly

### Monitoring

- Set up error tracking with Sentry or similar service
- Configure performance monitoring
- Enable Netlify analytics if needed
- Monitor Firebase Authentication console for issues
- Check Stripe dashboard for payment processing status

### Firebase-Specific Troubleshooting

1. **Authentication Initialization**
   - Check browser console for Firebase initialization logs
   - Verify auth domain matches deployment URL
   - Ensure all required Firebase config variables are set

2. **Auth State Persistence**
   - Check if LOCAL persistence is working
   - Verify session handling across page reloads
   - Monitor token refresh cycles

## Rollback Procedure

If issues are detected after deployment:

1. Go to Netlify dashboard > Deploys
2. Find the last working deployment
3. Click "Publish deploy" on that version
4. Verify authentication and core features after rollback

## Support

For deployment issues:
1. Check Netlify's status page
2. Review application logs
3. Check Firebase Console for auth issues
4. Monitor Stripe Dashboard for payment problems
5. Contact support if needed

Remember to update this guide as deployment requirements change. 