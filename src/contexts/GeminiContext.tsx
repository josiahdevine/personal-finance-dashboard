import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import GeminiService from '../services/gemini';
import { GeminiContextType, ChatMessage, GeminiConfig } from '../types/gemini';
import { useAuth } from './AuthContext';

const GeminiContext = createContext<GeminiContextType | undefined>(undefined);

export const useGemini = () => {
  const context = useContext(GeminiContext);
  if (!context) {
    throw new Error('useGemini must be used within a GeminiProvider');
  }
  return context;
};

interface GeminiProviderProps {
  children: React.ReactNode;
}

export const GeminiProvider: React.FC<GeminiProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { currentUser } = useAuth();

  const geminiConfig: GeminiConfig = {
    apiKey: process.env.REACT_APP_GEMINI_API_KEY || '',
    projectId: process.env.REACT_APP_GEMINI_PROJECT_ID || '',
    location: process.env.REACT_APP_GEMINI_LOCATION || '',
    maxTokens: Number(process.env.REACT_APP_MAX_TOKENS) || 1000,
    temperature: Number(process.env.REACT_APP_TEMPERATURE) || 0.7,
  };

  const geminiService = new GeminiService(geminiConfig);

  const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: uuidv4(),
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, newMessage]);
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    try {
      setIsLoading(true);
      setError(null);

      // Add user message
      addMessage({
        role: 'user',
        content,
      });

      // Add loading message for assistant
      const loadingMessageId = uuidv4();
      setMessages(prev => [
        ...prev,
        {
          id: loadingMessageId,
          role: 'assistant',
          content: '',
          timestamp: Date.now(),
          loading: true,
        },
      ]);

      // Get response from Gemini
      const response = await geminiService.generateResponse(content);

      // Update loading message with response
      setMessages(prev =>
        prev.map(msg =>
          msg.id === loadingMessageId
            ? {
                ...msg,
                content: response.text,
                loading: false,
              }
            : msg
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to send message'));
      // Update loading message with error
      setMessages(prev =>
        prev.map(msg =>
          msg.loading
            ? {
                ...msg,
                content: 'Failed to generate response. Please try again.',
                loading: false,
                error: true,
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [addMessage, geminiService]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  // Load chat history from Firebase when user changes
  useEffect(() => {
    if (currentUser) {
      // TODO: Implement chat history loading from Firebase
    }
  }, [currentUser]);

  const value: GeminiContextType = {
    messages,
    addMessage,
    sendMessage,
    isLoading,
    error,
    clearChat,
  };

  return <GeminiContext.Provider value={value}>{children}</GeminiContext.Provider>;
};

export default GeminiContext; 