import React, { useState } from 'react';
import { EnhancedInput } from "../../../../components/ui/enhanced-input";

const AskAI: React.FC = () => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: 'Hello! I\'m your financial assistant. How can I help you today?',
      timestamp: new Date().toISOString(),
    },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    // Add user message
    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: query,
      timestamp: new Date().toISOString(),
    };
    
    setMessages([...messages, userMessage]);
    setQuery('');
    
    // Simulate AI response after a short delay
    setTimeout(() => {
      const aiResponses = [
        "Based on your spending patterns, I recommend setting aside 15% of your income for savings.",
        "Looking at your recent transactions, your biggest expense category is dining out. You might want to consider setting a budget for this category.",
        "Your investment portfolio is well-diversified. Consider increasing your contributions to your retirement accounts if possible.",
        "I notice you have some high-interest debt. Prioritizing paying this off could save you money in the long run.",
        "Your emergency fund looks healthy! You have approximately 4 months of expenses saved.",
      ];
      
      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      
      const aiMessage = {
        id: messages.length + 2,
        type: 'ai',
        content: randomResponse,
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prevMessages => [...prevMessages, aiMessage]);
    }, 1000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Ask AI Assistant</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden flex flex-col h-[calc(100vh-200px)]">
        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border-b border-indigo-100 dark:border-indigo-800">
          <h2 className="text-lg font-medium text-indigo-700 dark:text-indigo-300">Financial AI Assistant</h2>
          <p className="text-sm text-indigo-600 dark:text-indigo-400">
            Ask me anything about your finances, budgeting, or investment strategies.
          </p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.type === 'user' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <EnhancedInput
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a question about your finances..."
              className="flex-1"
            />
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </form>
        </div>
      </div>
      
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-2">Suggested Questions</h3>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setQuery("How much did I spend on dining last month?")}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            How much did I spend on dining last month?
          </button>
          <button 
            onClick={() => setQuery("What's my current savings rate?")}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            What's my current savings rate?
          </button>
          <button 
            onClick={() => setQuery("How can I improve my investment strategy?")}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            How can I improve my investment strategy?
          </button>
        </div>
      </div>
    </div>
  );
};

export default AskAI;
