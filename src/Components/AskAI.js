import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { HiOutlineLightningBolt, HiOutlineChartBar, HiOutlineCurrencyDollar, HiOutlineHome, HiOutlineCreditCard, HiOutlineBookOpen, HiOutlinePaperAirplane, HiOutlineRefresh } from 'react-icons/hi';
import api from '../services/api';
import { useGemini } from '../contexts/GeminiContext';

const AskAI = () => {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [suggestedQuestions, setSuggestedQuestions] = useState([]);
    const [userData, setUserData] = useState(null);
    const [activeCategory, setActiveCategory] = useState('general');
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const chatContainerRef = useRef(null);
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { messages, sendMessage, clearChat } = useGemini();

    // Scroll to bottom of messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Auto focus input field
    useEffect(() => {
        inputRef.current?.focus();
    }, [isLoading]);

    // Fetch user data when component mounts
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setIsLoading(true);
                const response = await api.get('/api/accounts');
                setUserData(response.data);
                setSuggestedQuestions(getDefaultSuggestedQuestions());
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching user data:', error);
                toast.error('Failed to fetch your financial data. Using sample data instead.');
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [currentUser]);

    const getDefaultSuggestedQuestions = () => {
        return [
            'What is my current net worth?',
            'How are my investments performing?',
            'What are my biggest expenses this month?',
            'How much am I spending on subscriptions?',
            'What is my debt-to-income ratio?',
            'Should I pay off my loans faster?'
        ];
    };

    const getCategorySpecificQuestions = (category) => {
        const questionsByCategory = {
            general: [
                'What is my current net worth?', 
                'How can I improve my financial health?',
                'What\'s my current monthly cash flow?'
            ],
            investing: [
                'How are my investments performing?', 
                'What\'s a good asset allocation for my age?',
                'Should I invest more in stocks or bonds?',
                'What are my investment returns year-to-date?'
            ],
            spending: [
                'What are my biggest expenses this month?', 
                'How does my spending compare to last month?',
                'Where can I cut back on spending?',
                'Am I spending too much on restaurants?'
            ],
            debt: [
                'What is my debt-to-income ratio?', 
                'Should I pay off my loans faster?',
                'What\'s the best strategy for paying off my debt?',
                'Should I refinance my mortgage?'
            ],
            housing: [
                'How much home can I afford?', 
                'Is it better to rent or buy in my area?',
                'What would my mortgage payment be on a $500,000 home?'
            ],
            retirement: [
                'Am I on track for retirement?', 
                'How much should I be saving in my 401k?',
                'When can I retire based on my current savings?'
            ]
        };
        
        return questionsByCategory[category] || questionsByCategory.general;
    };

    const handleSubmit = async (e, customMessage = null) => {
        if (e && e.preventDefault) {
            e.preventDefault();
        }
        
        const userMessage = customMessage || input.trim();
        if (!userMessage) return;
        
        setInput('');
        setIsLoading(true);
        
        try {
            await sendMessage(userMessage);
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to get AI response. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggestedQuestion = (question) => {
        handleSubmit(null, question);
    };

    const selectCategory = (category) => {
        setActiveCategory(category);
        setSuggestedQuestions(getCategorySpecificQuestions(category));
    };

    const resetChat = () => {
        clearChat();
        setSuggestedQuestions(getDefaultSuggestedQuestions());
        setActiveCategory('general');
    };

    const formatTimestamp = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (!currentUser) {
        navigate('/login');
        return null;
    }

    return (
        <div className="flex flex-col h-full max-w-5xl mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Ask AI</h1>
                <button
                    onClick={resetChat}
                    className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                >
                    <HiOutlineRefresh className="w-4 h-4 mr-1" />
                    Reset Chat
                </button>
            </div>

            <div className="flex-1 bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
                {/* Category selector */}
                <div className="border-b border-gray-200">
                    <div className="flex space-x-4 p-3 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                        <button
                            onClick={() => selectCategory('general')}
                            className={`flex items-center px-3 py-1 rounded-full text-sm ${
                                activeCategory === 'general'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <HiOutlineLightningBolt className="w-4 h-4 mr-1" />
                            General
                        </button>
                        <button
                            onClick={() => selectCategory('investing')}
                            className={`flex items-center px-3 py-1 rounded-full text-sm ${
                                activeCategory === 'investing'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <HiOutlineChartBar className="w-4 h-4 mr-1" />
                            Investing
                        </button>
                        <button
                            onClick={() => selectCategory('spending')}
                            className={`flex items-center px-3 py-1 rounded-full text-sm ${
                                activeCategory === 'spending'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <HiOutlineCurrencyDollar className="w-4 h-4 mr-1" />
                            Spending
                        </button>
                        <button
                            onClick={() => selectCategory('housing')}
                            className={`flex items-center px-3 py-1 rounded-full text-sm ${
                                activeCategory === 'housing'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <HiOutlineHome className="w-4 h-4 mr-1" />
                            Housing
                        </button>
                        <button
                            onClick={() => selectCategory('debt')}
                            className={`flex items-center px-3 py-1 rounded-full text-sm ${
                                activeCategory === 'debt'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <HiOutlineCreditCard className="w-4 h-4 mr-1" />
                            Debt
                        </button>
                        <button
                            onClick={() => selectCategory('retirement')}
                            className={`flex items-center px-3 py-1 rounded-full text-sm ${
                                activeCategory === 'retirement'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <HiOutlineBookOpen className="w-4 h-4 mr-1" />
                            Retirement
                        </button>
                    </div>
                </div>

                {/* Chat messages */}
                <div
                    ref={chatContainerRef}
                    className="flex-1 overflow-y-auto p-4 space-y-4"
                >
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`flex ${
                                message.role === 'user' ? 'justify-end' : 'justify-start'
                            }`}
                        >
                            <div
                                className={`max-w-[75%] rounded-lg p-3 ${
                                    message.role === 'user'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100'
                                }`}
                            >
                                <div className="text-sm">{message.content}</div>
                                <div className="text-xs mt-1 opacity-75">
                                    {formatTimestamp(message.timestamp)}
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {isLoading && (
                        <div className="flex justify-start mb-4">
                            <div className="bg-gray-100 text-gray-800 rounded-lg rounded-bl-none p-3">
                                <div className="flex space-x-1">
                                    <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                                    <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                </div>
                
                {/* Suggested questions */}
                <div className="px-4 pb-2">
                    <div className="overflow-x-auto whitespace-nowrap py-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                        {suggestedQuestions.map((question, index) => (
                            <button
                                key={index}
                                onClick={() => handleSuggestedQuestion(question)}
                                className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm px-3 py-1 rounded-full mr-2 mb-2"
                                disabled={isLoading}
                            >
                                {question}
                            </button>
                        ))}
                    </div>
                </div>
                
                {/* Input area */}
                <div className="border-t border-gray-200 p-3">
                    <form onSubmit={handleSubmit} className="flex items-center">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about your finances..."
                            className="flex-1 bg-gray-100 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            className="ml-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isLoading}
                        >
                            <HiOutlinePaperAirplane className="h-5 w-5 transform rotate-90" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AskAI; 