import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../../common/Card';
import { geminiService } from '../../../services/GeminiService';
import { useAuth } from '../../../contexts/AuthContext';
import { TransactionRepository } from '../../../models/TransactionRepository';
import { BudgetEntryRepository } from '../../../models/BudgetRepository';

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

const AskAI: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState<FinancialInsight[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const transactionRepo = new TransactionRepository();
  const budgetRepo = new BudgetEntryRepository();

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
        
        // Get transactions
        const transactions = await transactionRepo.findAll();
        
        // Get budget entries
        const budgetEntries = await budgetRepo.findAll();
        
        // Get AI-generated insights
        const result = await geminiService.generateInsights(
          transactions,
          budgetEntries
        );
        
        setInsights(result.insights);
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
          <h2 className="text-lg font-semibold text-gray-900">Chat with AI Assistant</h2>
        </Card.Header>
        <Card.Body>
          <div className="h-96 overflow-y-auto mb-4">
            <div className="space-y-4">
              <AnimatePresence>
                {messages.map(message => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[75%] rounded-lg px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs mt-1 opacity-75">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about your finances..."
              className="w-full rounded-lg border-gray-300 pr-12 focus:border-indigo-500 focus:ring-indigo-500"
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
        </Card.Body>
      </Card>
    </motion.div>
  );
};

export default AskAI; 