import { 
  getPlaidClient, 
  getPlaidConfig, 
  createSuccessResponse, 
  createErrorResponse 
} from './utils/plaid-client.js';

export const handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return createErrorResponse(405, { message: 'Method not allowed' });
  }

  try {
    const plaidClient = getPlaidClient();
    const config = getPlaidConfig();

    const request = {
      user: {
        // Get user ID from event.headers.authorization if available
        client_user_id: event.headers.authorization ? 
          event.headers.authorization.split(' ')[1] : 
          'default-user',
      },
      client_name: 'Personal Finance Dashboard',
      products: config.products,
      country_codes: config.countryCodes,
      language: config.language,
      webhook: config.webhookUrl,
    };

    // Add redirect URI if configured
    if (config.redirectUri) {
      request.redirect_uri = config.redirectUri;
    }

    const createTokenResponse = await plaidClient.linkTokenCreate(request);
    return createSuccessResponse(createTokenResponse.data);
  } catch (error) {
    console.error('Plaid initialization error:', error);
    return createErrorResponse(500, error);
  }
}; 