import { Handler } from '@netlify/functions';
import { GoogleGenerativeAI } from '@google/generative-ai';

const handler: Handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Verify authentication
    const authHeader = event.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Unauthorized' }),
      };
    }

    // Parse request body
    const body = JSON.parse(event.body || '{}');
    const { prompt, history } = body;

    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Prompt is required' }),
      };
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

    return {
      statusCode: 200,
      body: JSON.stringify({
        text,
        usage: {
          promptTokens: 0, // Actual token counts will be available in the response
          completionTokens: 0,
          totalTokens: 0,
        },
      }),
    };
  } catch (error) {
    console.error('Gemini API Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};

export { handler }; 