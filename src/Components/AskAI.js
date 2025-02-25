import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AIService from '../services/aiService';
import { useNavigate } from 'react-router-dom';

const AskAI = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [suggestedQuestions, setSuggestedQuestions] = useState([]);
    const [userData, setUserData] = useState(null);
    const messagesEndRef = useRef(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    // Scroll to bottom of messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Fetch user data when component mounts
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // TODO: Replace with actual API calls to get user data
                const data = {
                    netWorth: 100000,
                    salary: 75000,
                    location: 'New York',
                    accountTypes: ['Checking', 'Savings', 'Investment'],
                    loans: [
                        { type: 'Mortgage', amount: 300000, rate: 3.5 },
                        { type: 'Car Loan', amount: 20000, rate: 4.5 }
                    ],
                    investments: [
                        { type: 'Stocks', value: 50000 },
                        { type: '401k', value: 100000 }
                    ]
                };
                setUserData(data);
                
                // Generate initial suggested questions
                const questions = AIService.generateSuggestedQuestions(data);
                setSuggestedQuestions(questions);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        if (user) {
            fetchUserData();
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
        setIsLoading(true);

        try {
            const response = await AIService.generateResponse(userMessage, userData);
            setMessages(prev => [...prev, { text: response, isUser: false }]);
        } catch (error) {
            console.error('Error getting AI response:', error);
            setMessages(prev => [...prev, {
                text: 'Sorry, I encountered an error. Please try again.',
                isUser: false,
                isError: true
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggestedQuestion = (question) => {
        setInput(question);
        handleSubmit({ preventDefault: () => {}, target: null });
    };

    if (!user) {
        navigate('/login');
        return null;
    }

    return (
        <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
                <h1 className="text-2xl font-bold mb-2">Ask AI Financial Assistant</h1>
                <p className="text-gray-600">
                    Get personalized financial advice based on your data and financial goals.
                </p>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto mb-4 bg-white rounded-lg shadow-lg p-4">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`mb-4 ${message.isUser ? 'text-right' : 'text-left'}`}
                    >
                        <div
                            className={`inline-block p-4 rounded-lg ${
                                message.isUser
                                    ? 'bg-blue-600 text-white'
                                    : message.isError
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-gray-100 text-gray-900'
                            }`}
                        >
                            {message.text}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="text-left mb-4">
                        <div className="inline-block p-4 rounded-lg bg-gray-100">
                            <div className="flex items-center">
                                <div className="animate-pulse">Thinking...</div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions */}
            {suggestedQuestions.length > 0 && messages.length === 0 && (
                <div className="mb-4 bg-white rounded-lg shadow-lg p-4">
                    <h2 className="text-lg font-semibold mb-2">Suggested Questions</h2>
                    <div className="flex flex-wrap gap-2">
                        {suggestedQuestions.map((question, index) => (
                            <button
                                key={index}
                                onClick={() => handleSuggestedQuestion(question)}
                                className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full hover:bg-blue-100 transition-colors"
                            >
                                {question}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-4">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask me anything about your finances..."
                        className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AskAI; 