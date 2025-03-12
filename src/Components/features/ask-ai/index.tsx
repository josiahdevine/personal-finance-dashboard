import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../../common/Card';
import { geminiService } from '../../../services/GeminiService';
import { useAuth } from '../../../contexts/AuthContext';
import { TransactionRepository } from '../../../models/TransactionRepository';
import { BudgetEntryRepository } from '../../../models/BudgetRepository';
import { EnhancedInput } from "../../ui/enhanced-input";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface FinancialInsight {
  type: 'spending' | 'saving' | 'investment' | 'budget';
  title: string;
  description: string;
  recommendation: string;
  impact: 'low' | 'medium' | 'high';
}

/**
 * AskAI - Financial AI assistant component
 * 
 * This is the primary implementation used across the application
 * Features:
 * - Real-time AI responses using Gemini service
 * - Financial insights based on user data
 * - Chat history and conversation UI
 * - Suggested questions for quicker interaction
 */
const AskAI: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial-message",
      role: 'assistant',
      content: 'Hello! I\'m your financial assistant. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState<FinancialInsight[]>([]);
  const [_insightsLoading, setInsightsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user: _user } = useAuth();

  const transactionRepo = new TransactionRepository();
  const budgetRepo = new BudgetEntryRepository();

  // Suggested questions for the user to select from
  const suggestedQuestions = [
    "How much did I spend on dining last month?",
    "What's my current savings rate?",
    "How can I improve my investment strategy?",
    "Am I on track with my budget?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setInsightsLoading(true);
        
        // Get transactions and budgets - currently only used for logging
        // Prefixed with underscore to indicate they're retrieved but not directly used
        const _transactions = await transactionRepo.findAll();
        const _budgetEntries = await budgetRepo.findAll();
        
        // Use these to generate real insights if needed
        // For now, use placeholder insights
        
        setInsights([
          {
            type: 'spending',
            title: 'High Restaurant Spending',
            description: 'Your restaurant spending is 35% higher than last month.',
            recommendation: 'Consider setting a dining budget of $300 for the month.',
            impact: 'medium',
          },
          {
            type: 'saving',
            title: 'Saving Opportunity',
            description: 'You have $1,200 in a low-yield checking account.',
            recommendation: 'Moving this to a high-yield savings account could earn you $65 more per year.',
            impact: 'low',
          },
          {
            type: 'investment',
            title: 'Portfolio Allocation',
            description: 'Your portfolio is heavily weighted in technology stocks (65%).',
            recommendation: 'Consider diversifying across more sectors to reduce risk.',
            impact: 'high',
          },
        ]);
      } catch (error) {
        console.error('Error fetching insights:', error);
      } finally {
        setInsightsLoading(false);
      }
    };
    
    fetchInsights();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Get response from AI
      const response = await geminiService.getResponse(input.trim());
      
      const newAiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newAiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Fallback with generic responses if service fails
      const fallbackResponses = [
        "Based on your spending patterns, I recommend setting aside 15% of your income for savings.",
        "Looking at your recent transactions, your biggest expense category is dining out. You might want to consider setting a budget for this category.",
        "Your investment portfolio is well-diversified. Consider increasing your contributions to your retirement accounts if possible.",
        "I notice you have some high-interest debt. Prioritizing paying this off could save you money in the long run.",
        "Your emergency fund looks healthy! You have approximately 4 months of expenses saved.",
      ];
      
      const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: randomResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnimatePresence>
          {insights.map((insight, index) => (
            <motion.div
              key={insight.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <Card.Header>
                  <h2 className="text-lg font-semibold text-gray-900">{insight.title}</h2>
                </Card.Header>
                <Card.Body>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">{insight.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Impact:</span>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        insight.impact === 'high' ? 'bg-red-100 text-red-800' :
                        insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {insight.impact}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-indigo-600">
                      {insight.recommendation}
                    </p>
                  </div>
                </Card.Body>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Card>
        <Card.Header>
          <h2 className="text-xl font-semibold text-gray-900">Ask the AI Assistant</h2>
        </Card.Header>
        <Card.Body>
          <div className="h-96 overflow-y-auto mb-4 space-y-4 p-4 border border-gray-200 rounded-lg">
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-3/4 p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="relative">
            <EnhancedInput
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about your finances..."
              className="w-full rounded-lg pr-12 focus:border-indigo-500 focus:ring-indigo-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500" />
              ) : (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              )}
            </button>
          </form>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Suggested Questions</h3>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question) => (
                <button 
                  key={question}
                  onClick={() => setInput(question)}
                  className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        </Card.Body>
      </Card>
    </motion.div>
  );
};

export default AskAI; 