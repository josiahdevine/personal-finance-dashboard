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
2. Add all variables from your `.env` file
3. Ensure sensitive values are properly secured

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
- [ ] Confirm Plaid integration works
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
   - Verify Firebase configuration
   - Check authorized domains in Firebase Console
   - Ensure environment variables are correctly set

3. **API Connection Problems**
   - Verify API URL configuration
   - Check CORS settings
   - Confirm API is accessible from Netlify's servers

### Monitoring

- Set up error tracking with Sentry or similar service
- Configure performance monitoring
- Enable Netlify analytics if needed

## Rollback Procedure

If issues are detected after deployment:

1. Go to Netlify dashboard > Deploys
2. Find the last working deployment
3. Click "Publish deploy" on that version

## Support

For deployment issues:
1. Check Netlify's status page
2. Review application logs
3. Contact support if needed

Remember to update this guide as deployment requirements change. 