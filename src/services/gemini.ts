import { GoogleGenerativeAI } from '@google/generative-ai';
import { GeminiConfig, GeminiResponse, GeminiError } from '../types/gemini';

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private config: GeminiConfig;

  constructor(config: GeminiConfig) {
    this.config = config;
    this.genAI = new GoogleGenerativeAI(config.apiKey);
  }

  private async handleError(error: any): Promise<never> {
    const geminiError: GeminiError = new Error(error.message);
    geminiError.code = error.code;
    geminiError.details = error.details;
    geminiError.response = error.response;
    throw geminiError;
  }

  async generateResponse(prompt: string): Promise<GeminiResponse> {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        text,
        usage: {
          promptTokens: 0, // Actual token counts will be available in the response
          completionTokens: 0,
          totalTokens: 0,
        },
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async startChat(history: { role: string; content: string }[] = []) {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
      const chat = model.startChat({
        history,
        generationConfig: {
          maxOutputTokens: this.config.maxTokens,
          temperature: this.config.temperature,
        },
      });

      return chat;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async analyzeFinances(data: any) {
    try {
      const prompt = `
        Analyze the following financial data and provide insights:
        ${JSON.stringify(data)}
        
        Please provide insights on:
        1. Spending patterns
        2. Budget recommendations
        3. Investment opportunities
        4. Goal progress
      `;

      return this.generateResponse(prompt);
    } catch (error) {
      return this.handleError(error);
    }
  }
}

export const createGeminiService = (config: GeminiConfig) => {
  return new GeminiService(config);
};

export default GeminiService; 