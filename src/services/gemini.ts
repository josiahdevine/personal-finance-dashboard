import { GoogleGenerativeAI } from '@google/generative-ai';
import { GeminiConfig, GeminiMessage } from '../types/gemini';

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private config: GeminiConfig;

  constructor(config: GeminiConfig) {
    this.config = config;
    this.genAI = new GoogleGenerativeAI(config.apiKey);
  }

  private handleError(error: any): never {
    console.error('Gemini API Error:', error);
    throw new Error(error.message || 'Failed to communicate with Gemini API');
  }

  async generateContent(prompt: string): Promise<any> {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(prompt);
      return result.response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async generateResponse(prompt: string): Promise<any> {
    try {
      const response = await this.generateContent(prompt);
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async startChat(history: { role: string; content: string }[] = []): Promise<any> {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
      const formattedHistory: GeminiMessage[] = history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      const chat = model.startChat({
        history: formattedHistory,
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