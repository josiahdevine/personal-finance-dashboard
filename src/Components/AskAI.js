import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AIService from '../services/aiService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { HiOutlineLightningBolt, HiOutlineChartBar, HiOutlineCurrencyDollar, HiOutlineHome, HiOutlineCreditCard, HiOutlineBookOpen, HiOutlinePaperAirplane, HiOutlineEmojiHappy, HiOutlineRefresh } from 'react-icons/hi';
import api from '../services/api';

const AskAI = () => {
    const [messages, setMessages] = useState([
        {
            text: "Hello! I'm your financial assistant. I can help you analyze your accounts and provide insights. What would you like to know about your finances today?",
            isUser: false,
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [suggestedQuestions, setSuggestedQuestions] = useState([]);
    const [userData, setUserData] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [activeCategory, setActiveCategory] = useState('general');
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const chatContainerRef = useRef(null);
    const { user } = useAuth();
    const navigate = useNavigate();

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
                
                // Use our API service instead of direct fetch
                const response = await api.get('/api/accounts');
                setUserData(response.data);
                setSuggestedQuestions(getDefaultSuggestedQuestions());
                
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching user data:', error);
                toast.error('Failed to fetch your financial data. Using sample data instead.');
                
                // The API service will now handle mock data automatically
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [user]);

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

    const handleSubmit = async (e) => {
        e?.preventDefault();
        
        if (!input.trim() && (!e || e.type === 'submit')) return;
        
        const userMessage = input || (e.target && e.target.textContent);
        
        // Add user message to chat
        const newUserMessage = {
            text: userMessage,
            isUser: true,
            timestamp: new Date()
        };
        
        setMessages(prevMessages => [...prevMessages, newUserMessage]);
        setInput('');
        setIsLoading(true);
        
        // Show typing indicator
        setIsTyping(true);
        
        try {
            // In a production app, we would call a real AI API here
            // For now, simulate the API call with a delay and mock responses
            
            // Simulate API call to AI service
            setTimeout(async () => {
                let aiResponse;
                
                try {
                    // Here we would normally make an API call to Gemini or another AI service
                    // For development, we'll use preset responses based on user input
                    
                    if (userMessage.toLowerCase().includes('net worth')) {
                        aiResponse = `Based on your accounts, your current net worth is approximately $${userData?.netWorth?.toLocaleString() || '100,000'}. This includes your checking, savings, and investment accounts, minus your outstanding debts.`;
                    } else if (userMessage.toLowerCase().includes('invest')) {
                        aiResponse = `Your investments are performing well! Your portfolio has gained approximately 8.2% year-to-date. You currently have investments in stocks ($${userData?.investments?.[0]?.value?.toLocaleString() || '50,000'}) and retirement accounts ($${userData?.investments?.[1]?.value?.toLocaleString() || '100,000'}).`;
                    } else if (userMessage.toLowerCase().includes('expense') || userMessage.toLowerCase().includes('spending')) {
                        aiResponse = `Your top expenses this month were:\n1. Housing: $1,850\n2. Food & Dining: $750\n3. Transportation: $450\n\nYour spending is about 12% higher than last month, primarily due to increased dining out expenses.`;
                    } else if (userMessage.toLowerCase().includes('debt')) {
                        aiResponse = `Your current debt-to-income ratio is approximately 28%, which is within the healthy range. You have the following outstanding debts:\n- Mortgage: $${userData?.loans?.[0]?.amount?.toLocaleString() || '300,000'} at ${userData?.loans?.[0]?.rate || '3.5'}%\n- Car Loan: $${userData?.loans?.[1]?.amount?.toLocaleString() || '20,000'} at ${userData?.loans?.[1]?.rate || '4.5'}%`;
                    } else {
                        aiResponse = `Thank you for your question about "${userMessage}". Based on your financial profile, I can provide the following insights:\n\nYour current financial situation looks stable with a net worth of $${userData?.netWorth?.toLocaleString() || '100,000'} and a salary of $${userData?.salary?.toLocaleString() || '75,000'} per year.\n\nWould you like more specific information about a particular aspect of your finances?`;
                    }
                    
                    // Add AI response to chat
                    const aiMessage = {
                        text: aiResponse,
                        isUser: false,
                        timestamp: new Date()
                    };
                    
                    setMessages(prevMessages => [...prevMessages, aiMessage]);
                    
                    // Update suggested questions based on the conversation context
                    setSuggestedQuestions(getCategorySpecificQuestions(activeCategory));
                    
                } catch (aiError) {
                    console.error('Error generating AI response:', aiError);
                    
                    // Add error message to chat
                    setMessages(prevMessages => [
                        ...prevMessages, 
                        {
                            text: "I'm sorry, I encountered an error processing your request. Please try again later.",
                            isUser: false,
                            timestamp: new Date()
                        }
                    ]);
                    
                    toast.error('Failed to get a response from the AI service');
                }
                
                setIsTyping(false);
                setIsLoading(false);
                
            }, 1500);
            
        } catch (error) {
            console.error('Error sending message to AI:', error);
            
            setMessages(prevMessages => [
                ...prevMessages, 
                {
                    text: "I'm sorry, I encountered an error processing your request. Please try again later.",
                    isUser: false,
                    timestamp: new Date()
                }
            ]);
            
            setIsTyping(false);
            setIsLoading(false);
            toast.error('Failed to get a response from the AI service');
        }
    };

    const handleSuggestedQuestion = (question) => {
        setInput(question);
        handleSubmit({ target: { textContent: question } });
    };

    const selectCategory = (category) => {
        setActiveCategory(category);
        setSuggestedQuestions(getCategorySpecificQuestions(category));
    };

    const resetChat = () => {
        setMessages([
            {
                text: "Hello! I'm your financial assistant. I can help you analyze your accounts and provide insights. What would you like to know about your finances today?",
                isUser: false,
                timestamp: new Date()
            }
        ]);
        setSuggestedQuestions(getDefaultSuggestedQuestions());
        setActiveCategory('general');
    };

    const formatTimestamp = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (!user) {
        navigate('/login');
        return null;
    }

    return (
        <div className="flex flex-col h-full max-w-5xl mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Ask AI</h1>
                <button
                    onClick={resetChat}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded-md flex items-center"
                >
                    <HiOutlineRefresh className="mr-1" /> Reset Chat
                </button>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 h-[calc(100vh-180px)]">
                {/* Left sidebar - categories */}
                <div className="md:w-1/5 bg-white rounded-lg shadow-md p-4">
                    <h2 className="font-medium text-gray-700 mb-3">Topics</h2>
                    <div className="space-y-2">
                        <button 
                            onClick={() => selectCategory('general')}
                            className={`w-full text-left px-3 py-2 rounded-md flex items-center ${activeCategory === 'general' ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'}`}
                        >
                            <HiOutlineLightningBolt className="mr-2" /> General
                        </button>
                        <button 
                            onClick={() => selectCategory('investing')}
                            className={`w-full text-left px-3 py-2 rounded-md flex items-center ${activeCategory === 'investing' ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'}`}
                        >
                            <HiOutlineChartBar className="mr-2" /> Investing
                        </button>
                        <button 
                            onClick={() => selectCategory('spending')}
                            className={`w-full text-left px-3 py-2 rounded-md flex items-center ${activeCategory === 'spending' ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'}`}
                        >
                            <HiOutlineCurrencyDollar className="mr-2" /> Spending
                        </button>
                        <button 
                            onClick={() => selectCategory('debt')}
                            className={`w-full text-left px-3 py-2 rounded-md flex items-center ${activeCategory === 'debt' ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'}`}
                        >
                            <HiOutlineCreditCard className="mr-2" /> Debt
                        </button>
                        <button 
                            onClick={() => selectCategory('housing')}
                            className={`w-full text-left px-3 py-2 rounded-md flex items-center ${activeCategory === 'housing' ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'}`}
                        >
                            <HiOutlineHome className="mr-2" /> Housing
                        </button>
                        <button 
                            onClick={() => selectCategory('retirement')}
                            className={`w-full text-left px-3 py-2 rounded-md flex items-center ${activeCategory === 'retirement' ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'}`}
                        >
                            <HiOutlineBookOpen className="mr-2" /> Retirement
                        </button>
                    </div>
                </div>
                
                {/* Main chat area */}
                <div className="flex-1 flex flex-col bg-white rounded-lg shadow-md">
                    {/* Chat messages */}
                    <div 
                        ref={chatContainerRef}
                        className="flex-1 p-4 overflow-y-auto"
                    >
                        {messages.map((message, index) => (
                            <div 
                                key={index} 
                                className={`mb-4 flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                            >
                                <div 
                                    className={`max-w-3/4 rounded-lg p-3 ${
                                        message.isUser 
                                            ? 'bg-blue-500 text-white rounded-br-none' 
                                            : 'bg-gray-100 text-gray-800 rounded-bl-none'
                                    }`}
                                >
                                    <div className="whitespace-pre-line">{message.text}</div>
                                    <div 
                                        className={`text-xs mt-1 ${
                                            message.isUser ? 'text-blue-200' : 'text-gray-500'
                                        }`}
                                    >
                                        {formatTimestamp(message.timestamp)}
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {/* Typing indicator */}
                        {isTyping && (
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
        </div>
    );
};

export default AskAI; 