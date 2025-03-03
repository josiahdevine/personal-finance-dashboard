import { Handler } from '@netlify/functions';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createLogger } from './utils/logger.js';
import corsHandler from './utils/cors-handler.js';
import authHandler from './utils/auth-handler.js';

const logger = createLogger('gemini');

export const handler: Handler = async (event, context) => {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const origin = event.headers.origin || event.headers.Origin || '*';

  logger.info('Received Gemini request:', {
    requestId,
    httpMethod: event.httpMethod,
    path: event.path,
    origin
  });

  // Always handle OPTIONS requests first, before any auth checks
  if (event.httpMethod === "OPTIONS") {
    logger.info('Handling OPTIONS preflight for Gemini', { requestId });
    return corsHandler.handleCorsPreflightRequest(event);
  }

  try {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
      return corsHandler.createCorsResponse(405, {
        error: 'Method not allowed',
        requestId
      }, origin);
    }

    // Get user from request (with modified auth handling)
    const user = await authHandler.getUserFromRequest(event);
    
    // Since we're handling auth ourselves, check if user is authenticated
    if (!user.isAuthenticated) {
      logger.warn('Unauthorized request', { requestId, userId: user.uid });
      return corsHandler.createCorsResponse(401, {
        error: "Unauthorized",
        message: "Authentication required for this endpoint",
        requestId
      }, origin);
    }

    // Parse request body
    const body = JSON.parse(event.body || '{}');
    const { prompt, history } = body;

    if (!prompt) {
      return corsHandler.createCorsResponse(400, {
        error: 'Prompt is required',
        requestId
      }, origin);
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    let response;
    if (history) {
      // Use chat for conversations with history
      const chat = model.startChat({
        history,
        generationConfig: {
          maxOutputTokens: Number(process.env.MAX_TOKENS) || 1000,
          temperature: Number(process.env.TEMPERATURE) || 0.7,
        },
      });
      response = await chat.sendMessage(prompt);
    } else {
      // Use single generation for one-off prompts
      response = await model.generateContent(prompt);
    }

    const result = await response.response;
    const text = result.text();

    return corsHandler.createCorsResponse(200, {
      text,
      usage: {
        promptTokens: 0, // Actual token counts will be available in the response
        completionTokens: 0,
        totalTokens: 0,
      },
      requestId
    }, origin);
  } catch (error) {
    logger.error('Gemini API Error:', {
      error: error.message,
      stack: error.stack,
      requestId
    });
    
    return corsHandler.createCorsResponse(500, {
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error',
      requestId
    }, origin);
  }
}; 