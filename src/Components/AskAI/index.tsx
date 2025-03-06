import React, { useState, useRef, useEffect } from 'react';
import { Card } from '../../components/common/Card';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
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
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<FinancialInsight[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        // TODO: Replace with actual API call
        const response = await fetch('/api/ai/insights');
        const data = await response.json();
        setInsights(data);
      } catch (err) {
        console.error('Error fetching insights:', err);
      }
    };

    fetchInsights();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.content }),
      });

      const data = await response.json();
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {insights.map(insight => (
          <Card key={insight.title}>
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
        ))}
      </div>

      <Card>
        <Card.Header>
          <h2 className="text-lg font-semibold text-gray-900">Chat with AI Assistant</h2>
        </Card.Header>
        <Card.Body>
          <div className="h-96 overflow-y-auto mb-4">
            <div className="space-y-4">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[75%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs mt-1 opacity-75">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
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
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 disabled:opacity-50"
            >
              {loading ? (
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
    </div>
  );
};

export default AskAI; 