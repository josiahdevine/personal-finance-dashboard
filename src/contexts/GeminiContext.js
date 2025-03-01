import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

const GeminiContext = createContext();

export const useGemini = () => {
    const context = useContext(GeminiContext);
    if (!context) {
        throw new Error('useGemini must be used within a GeminiProvider');
    }
    return context;
};

export const GeminiProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const sendMessage = async (message) => {
        try {
            setIsLoading(true);
            setError(null);
            
            // Add user message to chat
            setMessages(prev => [...prev, { role: 'user', content: message }]);
            
            // Call Gemini API
            const response = await axios.post(
                '/.netlify/functions/gemini',
                {
                    prompt: message,
                    history: messages
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Add AI response to chat
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: response.data.text
            }]);
            
        } catch (error) {
            console.error('Error sending message:', error);
            setError(error.message || 'Failed to send message');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const clearChat = () => {
        setMessages([]);
        setError(null);
    };

    const value = {
        messages,
        sendMessage,
        clearChat,
        isLoading,
        error
    };

    return (
        <GeminiContext.Provider value={value}>
            {children}
        </GeminiContext.Provider>
    );
}; 