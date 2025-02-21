// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('authToken') || null);
    const [userId, setUserId] = useState(null);
    const [username, setUsername] = useState(null);

    // Update user info when token changes
    useEffect(() => {
        if (token) {
            try {
                const decoded = jwtDecode(token);
                
                // Check if token is expired
                const currentTime = Date.now() / 1000;
                if (decoded.exp < currentTime) {
                    console.log('Token expired, logging out');
                    toast.error('Your session has expired. Please log in again.');
                    logout();
                    return;
                }

                setUserId(decoded.userId);
                setUsername(decoded.username);
                localStorage.setItem('authToken', token);

                // Set up auto-logout when token expires
                const timeUntilExpiry = (decoded.exp - currentTime) * 1000;
                const logoutTimer = setTimeout(() => {
                    console.log('Token expired, logging out');
                    toast.error('Your session has expired. Please log in again.');
                    logout();
                }, timeUntilExpiry);

                // Cleanup timer on unmount or token change
                return () => clearTimeout(logoutTimer);
            } catch (error) {
                console.error('Error decoding token:', error);
                toast.error('Authentication error. Please log in again.');
                logout();
            }
        } else {
            localStorage.removeItem('authToken');
            setUserId(null);
            setUsername(null);
        }
    }, [token]);

    // Login function to set token
    const login = (newToken) => {
        setToken(newToken);
    };

    // Logout function to clear everything
    const logout = () => {
        setToken(null);
        setUserId(null);
        setUsername(null);
        localStorage.removeItem('authToken');
    };

    const contextValue = {
        token,
        userId,
        username,
        login,
        logout,
        isAuthenticated: !!token
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthProvider };