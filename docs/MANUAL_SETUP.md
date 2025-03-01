# Manual Setup Guide for Gemini AI Integration

## Google Cloud Platform Setup

1. Create a New Project
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Click "New Project"
   - Name it "personal-finance-gemini" or similar
   - Note the Project ID
   -copper-cider-452023-n6

2. Enable Gemini API
   - In the Cloud Console, go to "APIs & Services" > "Library"
   - Search for "Gemini API"
   - Click "Enable"

3. Create API Credentials
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   -AIzaSyCdMReYKk_kcogFTc5g56EzFMxKDNrKcW0
   - Copy the generated API key
   - Click "Edit" on the API key
   - Set restrictions:
     - Application restrictions: "HTTP referrers (websites)"
     - Add your domain: "https://trypersonalfinance.com/*"
     - API restrictions: "Gemini API"

## Netlify Setup

1. Environment Variables
   Add the following environment variables in Netlify (Settings > Build & Deploy > Environment):
   ```
   GEMINI_API_KEY=AIzaSyCdMReYKk_kcogFTc5g56EzFMxKDNrKcW0
   MAX_TOKENS=1000
   TEMPERATURE=0.7
   ```

2. Function Dependencies
   Add to your `package.json`:
   ```json
   {
     "dependencies": {
       "@google/generative-ai": "^0.1.0",
       "@netlify/functions": "^2.0.0",
       "@types/uuid": "^9.0.8",
       "uuid": "^9.0.1"
     }
   }
   ```

3. Build Settings
   Verify build settings in Netlify:
   - Build command: `node netlify-build.js`
   - Publish directory: `build`
   - Functions directory: `functions`

## Firebase Setup

1. Update Security Rules
   Add to your Firestore security rules:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId}/chats/{chatId} {
         allow read: if request.auth != null && request.auth.uid == userId;
         allow write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

2. Create Chat Collection
   - Collection: `users/{userId}/chats`
   - Document structure:
     ```typescript
     interface Chat {
       id: string;
       messages: {
         id: string;
         role: 'user' | 'assistant';
         content: string;
         timestamp: number;
       }[];
       createdAt: number;
       updatedAt: number;
     }
     ```

## Testing Setup

1. Verify API Access
   ```bash
   curl -X POST https://trypersonalfinance.com/.netlify/functions/gemini \
     -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"prompt":"Hello, how can you help me with my finances?"}'
   ```

2. Test CORS
   - Open browser console
   - Try making a request to the Gemini endpoint
   - Verify no CORS errors

3. Test Rate Limiting
   - Make multiple rapid requests
   - Verify rate limiting is working (60 requests/minute)

## Monitoring Setup

1. Set up Error Tracking
   - Configure Sentry or similar service
   - Add error reporting to Gemini function

2. Set up Performance Monitoring
   - Configure Google Cloud Monitoring
   - Set up alerts for:
     - Error rates > 5%
     - Response times > 2s
     - Rate limit breaches

## Security Checklist

- [ ] API key is properly restricted
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] Authentication is required
- [ ] PII is properly handled
- [ ] Error messages are sanitized
- [ ] Logging excludes sensitive data

## Post-Setup Verification

1. Test Chat Interface
   - Send test messages
   - Verify responses
   - Check message history
   - Test error handling

2. Test Financial Analysis
   - Upload sample financial data
   - Request analysis
   - Verify insights

3. Monitor Initial Usage
   - Watch error rates
   - Check response times
   - Verify token usage

## Support Resources

- [Gemini API Documentation](https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/gemini)
- [Netlify Functions Documentation](https://docs.netlify.com/functions/overview/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Query Documentation](https://tanstack.com/query/latest)

## Troubleshooting

Common issues and solutions:

1. API Key Issues
   - Verify key restrictions
   - Check environment variables
   - Validate API access

2. CORS Issues
   - Check netlify.toml configuration
   - Verify origin headers
   - Test with curl

3. Rate Limiting
   - Monitor usage
   - Implement caching
   - Adjust limits if needed

4. Authentication
   - Verify Firebase tokens
   - Check permissions
   - Test different auth states 