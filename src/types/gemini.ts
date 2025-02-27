import { ChatSession } from '@google/generative-ai';

export interface GeminiConfig {
  apiKey: string;
  projectId: string;
  location: string;
  maxTokens: number;
  temperature: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  error?: boolean;
  loading?: boolean;
}

export interface GeminiContextType {
  messages: ChatMessage[];
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  sendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
  clearChat: () => void;
}

export interface GeminiResponse {
  text: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface FinancialInsight {
  type: 'spending' | 'budget' | 'investment' | 'goal';
  content: string;
  confidence: number;
  timestamp: number;
}

export interface GeminiError extends Error {
  code?: string;
  details?: string;
  response?: any;
} 