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

export interface GeminiMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
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
  message: GeminiMessage;
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

export interface GeminiError {
  code: string;
  message: string;
  details?: Record<string, any>;
} 