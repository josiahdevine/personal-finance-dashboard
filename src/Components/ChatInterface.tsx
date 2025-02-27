import React, { useState, useRef, useEffect } from 'react';
import { useGemini } from '../contexts/GeminiContext';
import { ChatMessage } from '../types/gemini';
import { HiPaperAirplane, HiOutlineRefresh } from 'react-icons/hi';

const ChatInterface: React.FC = () => {
  const [input, setInput] = useState('');
  const { messages, sendMessage, isLoading, clearChat } = useGemini();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    await sendMessage(input);
    setInput('');
  };

  const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => (
    <div
      className={`flex ${
        message.role === 'user' ? 'justify-end' : 'justify-start'
      } mb-4`}
    >
      <div
        className={`max-w-[70%] rounded-lg p-3 ${
          message.role === 'user'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 dark:bg-gray-700 dark:text-white'
        } ${message.error ? 'bg-red-100 dark:bg-red-900' : ''}`}
      >
        {message.loading ? (
          <div className="flex items-center space-x-2">
            <div className="animate-pulse">Thinking...</div>
            <div className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="h-2 w-2 bg-current rounded-full animate-bounce"></div>
          </div>
        ) : (
          <div className="whitespace-pre-wrap">{message.content}</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
        <h2 className="text-xl font-semibold dark:text-white">AI Assistant</h2>
        <button
          onClick={clearChat}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          title="Clear chat"
        >
          <HiOutlineRefresh className="w-5 h-5 dark:text-white" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t dark:border-gray-700">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`p-2 rounded-lg ${
              isLoading || !input.trim()
                ? 'bg-gray-300 cursor-not-allowed dark:bg-gray-600'
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white transition-colors`}
          >
            <HiPaperAirplane className="w-5 h-5 transform rotate-90" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface; 