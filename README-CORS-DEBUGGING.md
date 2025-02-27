# CORS Debugging Guide for Personal Finance Dashboard

This guide helps troubleshoot Cross-Origin Resource Sharing (CORS) issues with the Personal Finance Dashboard API.

## Common CORS Errors

If you're seeing errors like these in your browser console:

```
Access to XMLHttpRequest at 'https://api.trypersonalfinance.com/api/plaid/status' from origin 'https://trypersonalfinance.com' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: It does not have HTTP ok status.
```

```
Failed to load resource: net::ERR_FAILED
```

These indicate CORS policy violations, typically caused by:

1. Missing or incorrect CORS headers in API responses
2. Issues with handling OPTIONS preflight requests
3. DNS or routing issues with the API subdomain
4. Authentication or authorization problems

## Diagnostic Tools

### 1. CORS Debug Endpoint

A special diagnostic endpoint has been set up to help debug CORS issues:

```
https://api.trypersonalfinance.com/api/debug/cors
```

This endpoint will return detailed information about:
- The request headers received by the server
- The CORS headers being returned
- Environment variables that might affect CORS behavior

### 2. CORS Testing Tool

Use the included `cors-test.html` file to test API endpoints:

1. Open `cors-test.html` in your browser
2. Click the buttons to test various API endpoints
3. Check the results for any errors

### 3. Browser Developer Tools

For more detailed debugging:

1. Open your browser's Developer Tools (F12 or Ctrl+Shift+I)
2. Go to the Network tab
3. Filter by "XHR" or "Fetch" requests
4. Look for failed requests (red)
5. Examine the "Headers" and "Response" tabs for issues

## Common Fixes

### If CORS errors persist:

1. **Check DNS Configuration**
   - Ensure `api.trypersonalfinance.com` points to the correct Netlify deployment
   - Verify using `ping api.trypersonalfinance.com`

2. **Clear Browser Cache**
   - Browsers cache CORS failures, so clear cache and cookies

3. **Verify Netlify Configuration**
   - Check `netlify.toml` for correct redirects and headers
   - Ensure all functions handle OPTIONS requests correctly
   - Verify environment variables are set correctly

4. **Authentication Issues**
   - If CORS errors occur only with authenticated requests, check token handling

## Netlify Function Structure

All API functions should follow this pattern:

```javascript
exports.handler = async function(event, context) {
  // Get origin from request
  const origin = event.headers.origin || event.headers.Origin || '*';
  
  // Set CORS headers
  const headers = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "Content-Type, Authorization...",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS...",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };

  // Handle OPTIONS requests
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers,
      body: ""
    };
  }

  // Normal request handling...
}
```

## Support

If you continue to experience CORS issues after trying these steps, contact the development team with:

1. Screenshots of the browser console errors
2. The response from the `/api/debug/cors` endpoint
3. The specific API endpoint that's failing
4. Browser and OS information 