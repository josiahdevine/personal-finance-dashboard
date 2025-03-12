import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/shadcn-avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BaseComponentProps } from '@/types/base';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AiResponse {
  answer: string;
  suggestions: string[];
}

export const AiAssistant: React.FC<BaseComponentProps> = ({ className = '' }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your financial assistant. How can I help you today?",
      timestamp: new Date(),
    }
  ]);
  const [suggestions, setSuggestions] = useState<string[]>([
    "How much did I spend on dining last month?",
    "What's my current savings rate?",
    "How can I improve my investment strategy?"
  ]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateMessageId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputMessage.trim()) {
      setError('Please enter a question');
      return;
    }

    // Add user message to chat
    const userMessage: Message = {
      id: generateMessageId(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setError(null);
    setIsLoading(true);

    try {
      // API call to get AI response
      const response = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: userMessage.content }),
      });

      if (!response.ok) {
        throw new Error('Error getting response');
      }

      const data: AiResponse = await response.json();
      
      // Add AI response to chat
      const assistantMessage: Message = {
        id: generateMessageId(),
        role: 'assistant',
        content: data.answer,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Update suggestions
      if (data.suggestions && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
      }
    } catch (err) {
      setError('Error getting response');
      console.error('Error asking AI:', err);
    } finally {
      setIsLoading(false);
      // Focus back on input after response
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [inputMessage]);

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
    // Focus on the input field after selecting a suggestion
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className={`w-full max-w-3xl mx-auto shadow-lg ${className}`}>
      <CardHeader className="bg-primary/5 border-b">
        <CardTitle className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground">
              AI
            </AvatarFallback>
          </Avatar>
          Financial AI Assistant
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-[400px] p-4">
          <div className="space-y-4 pt-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex max-w-[80%] ${
                    message.role === 'user'
                      ? 'ml-auto flex-row-reverse'
                      : 'mr-auto'
                  }`}
                >
                  <div className="flex-shrink-0 mt-1">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback 
                        className={`
                        ${message.role === 'user' 
                          ? 'bg-secondary text-secondary-foreground' 
                          : 'bg-primary text-primary-foreground'}`}
                      >
                        {message.role === 'user' ? 'U' : 'AI'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <div 
                    className={`mx-2 px-4 py-2 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-tr-none'
                        : 'bg-muted rounded-tl-none'
                    }`}
                  >
                    <div className="whitespace-pre-wrap break-words">{message.content}</div>
                    <div 
                      className={`text-xs mt-1 text-right ${
                        message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}
                    >
                      {formatTimestamp(message.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex max-w-[80%] mr-auto">
                  <div className="flex-shrink-0 mt-1">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        AI
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="mx-2 px-4 py-2 rounded-lg bg-muted rounded-tl-none">
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="h-2 w-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="h-2 w-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
      
      <CardFooter className="flex flex-col p-4 border-t space-y-4">
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full bg-destructive/10 text-destructive p-2 rounded-md text-sm"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
        
        {suggestions.length > 0 && (
          <div className="w-full">
            <h3 className="text-xs font-medium text-muted-foreground mb-2">Suggested Questions:</h3>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-xs"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="w-full flex gap-2">
          <Textarea
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask me anything about your finances..."
            className="min-h-[60px] resize-none"
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <Button 
            type="submit" 
            disabled={isLoading || !inputMessage.trim()}
            className="self-end"
          >
            Send
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};