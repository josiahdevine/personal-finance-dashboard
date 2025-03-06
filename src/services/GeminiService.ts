import { GoogleGenerativeAI } from '@google/generative-ai';
import { CacheService } from './CacheService';

export class GeminiService {
  private static instance: GeminiService;
  private model: any;
  private cache: CacheService;
  private cachePrefix = 'gemini_';
  private cacheTTL = 24 * 60 * 60 * 1000; // 24 hours

  private constructor() {
    const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY!);
    this.model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    this.cache = CacheService.getInstance();
  }

  static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  private getCacheKey(query: string): string {
    return `${this.cachePrefix}${query}`;
  }

  async getResponse(query: string): Promise<string> {
    try {
      // Check cache first
      const cacheKey = this.getCacheKey(query);
      const cachedResponse = this.cache.get<string>(cacheKey);
      if (cachedResponse) {
        return cachedResponse;
      }

      // Generate response from Gemini
      const result = await this.model.generateContent(
        `You are a personal finance assistant. Please provide advice and insights about: ${query}`
      );
      const response = result.response.text();

      // Cache the response
      this.cache.set(cacheKey, response, this.cacheTTL);

      return response;
    } catch (error) {
      console.error('Error getting AI response:', error);
      throw error;
    }
  }

  async getFinancialInsights(
    transactions: any[],
    budgets: any[],
    query: string
  ): Promise<string> {
    try {
      const prompt = `
        As a personal finance assistant, analyze the following data and ${query}:
        
        Transactions: ${JSON.stringify(transactions)}
        Budgets: ${JSON.stringify(budgets)}
        
        Please provide specific insights and recommendations based on this data.
      `;

      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Error getting financial insights:', error);
      throw error;
    }
  }

  async getSavingsSuggestions(
    income: number,
    expenses: any[],
    goals: any[]
  ): Promise<string> {
    try {
      const prompt = `
        As a personal finance assistant, analyze the following financial situation:
        
        Monthly Income: ${income}
        Monthly Expenses: ${JSON.stringify(expenses)}
        Financial Goals: ${JSON.stringify(goals)}
        
        Please provide specific suggestions for:
        1. Areas where expenses can be reduced
        2. Potential savings strategies
        3. Timeline to achieve financial goals
        4. Investment recommendations
      `;

      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Error getting savings suggestions:', error);
      throw error;
    }
  }

  async getBudgetRecommendations(
    income: number,
    expenses: any[],
    categories: string[]
  ): Promise<string> {
    try {
      const prompt = `
        As a personal finance assistant, create a recommended budget based on:
        
        Monthly Income: ${income}
        Current Expenses: ${JSON.stringify(expenses)}
        Expense Categories: ${JSON.stringify(categories)}
        
        Please provide:
        1. Recommended budget allocation for each category
        2. Explanation of the 50/30/20 rule application
        3. Specific areas for potential optimization
        4. Long-term financial planning suggestions
      `;

      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Error getting budget recommendations:', error);
      throw error;
    }
  }
} 