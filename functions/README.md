# Netlify Functions for Personal Finance Dashboard

This directory contains serverless functions that power the API for the Personal Finance Dashboard application.

## Available Endpoints

- `/health-check`: Returns the API health status
- `/create-link-token`: Creates a Plaid link token for connecting bank accounts

## Local Development

To test functions locally:

1. Install the Netlify CLI:
   ```
   npm install -g netlify-cli
   ```

2. Start the local development server:
   ```
   netlify dev
   ```

3. Access functions at `http://localhost:8888/.netlify/functions/health-check`

## Production Deployment

Functions are automatically deployed when pushing to the main branch. They will be available at:

- `https://api.trypersonalfinance.com/health-check`
- `https://api.trypersonalfinance.com/create-link-token`

## Adding New Functions

1. Create a new `.js` file in this directory
2. Export a handler function that follows this pattern:
   ```javascript
   exports.handler = async function(event, context) {
     // Your code here
     return {
       statusCode: 200,
       body: JSON.stringify({ message: "Success" })
     };
   }
   ```

3. The function will be available at `/.netlify/functions/your-file-name` or with the API subdomain at `/your-file-name`

## Environment Variables

Functions have access to environment variables set in the Netlify dashboard or in `netlify.toml`. 