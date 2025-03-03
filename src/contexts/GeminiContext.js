import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const GeminiContext = createContext();

export const useGemini = () => {
    const context = useContext(GeminiContext);
    if (!context) {
        throw new Error('useGemini must be used within a GeminiProvider');
    }
    return context;
};

export const GeminiProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const sendMessage = async (message) => {
        if (!currentUser) {
            setError('You must be logged in to use the AI assistant');
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            
            // Add user message to chat
            const userMessage = { role: 'user', content: message };
            setMessages(prev => [...prev, userMessage]);
            
            // Get the current user's token
            const token = await currentUser.getIdToken();
            
            // Format history for Gemini API
            const formattedHistory = messages.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            }));
            
            // Call Gemini API
            const response = await axios.post(
                '/.netlify/functions/gemini',
                {
                    prompt: message,
                    history: formattedHistory
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            // Add AI response to chat
            const assistantMessage = { 
                role: 'assistant', 
                content: response.data.text
            };
            setMessages(prev => [...prev, assistantMessage]);
            
        } catch (error) {
                        if (error.response?.status === 401) {
                setError('Your session has expired. Please log in again.');
            } else {
                setError(error.response?.data?.message || 'Failed to send message');
            }
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
        error,
        isAuthenticated: !!currentUser
    };

    return (
        <GeminiContext.Provider value={value}>
            {children}
        </GeminiContext.Provider>
    );
}; 