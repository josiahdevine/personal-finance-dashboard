import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

console.log('AuthMenu.js: Initializing AuthMenu component');

const AuthMenu = ({ isOpen, onClose }) => {
    console.log('AuthMenu.js: AuthMenu component rendering with props:', { isOpen });
    
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    
    // Log auth state
    const { login, register, loading } = useAuth();
    console.log('AuthMenu.js: Auth state received:', { 
        loginExists: typeof login === 'function',
        registerExists: typeof register === 'function',
        loading 
    });
    
    const menuRef = useRef(null);
    const navigate = useNavigate();

    // Log component lifecycle
    useEffect(() => {
        console.log('AuthMenu.js: Component mounted');
        return () => {
            console.log('AuthMenu.js: Component unmounting');
        };
    }, []);

    // Log open/close state changes
    useEffect(() => {
        console.log('AuthMenu.js: isOpen state changed:', isOpen);
    }, [isOpen]);

    // Log form mode changes
    useEffect(() => {
        console.log('AuthMenu.js: Form mode changed:', isLogin ? 'Login' : 'Register');
    }, [isLogin]);

    useEffect(() => {
        console.log('AuthMenu.js: Setting up click outside handler');
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                console.log('AuthMenu.js: Click detected outside menu, closing');
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            console.log('AuthMenu.js: Removing click outside handler');
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log(`AuthMenu.js: Form field "${name}" changed:`, value.length > 0 ? '[value entered]' : '[empty]');
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(`AuthMenu.js: Form submitted in ${isLogin ? 'login' : 'register'} mode`);

        try {
            if (isLogin) {
                console.log('AuthMenu.js: Attempting login with email:', formData.email);
                if (typeof login !== 'function') {
                    console.error('AuthMenu.js: login is not a function!', { loginType: typeof login });
                    toast.error('Authentication service unavailable. Please try again later.');
                    return;
                }
                await login(formData.email, formData.password);
                console.log('AuthMenu.js: Login successful, navigating to dashboard');
                navigate('/dashboard');
            } else {
                if (formData.password !== formData.confirmPassword) {
                    console.warn('AuthMenu.js: Passwords do not match');
                    toast.error('Passwords do not match');
                    return;
                }
                
                console.log('AuthMenu.js: Attempting registration with email:', formData.email);
                if (typeof register !== 'function') {
                    console.error('AuthMenu.js: register is not a function!', { registerType: typeof register });
                    toast.error('Registration service unavailable. Please try again later.');
                    return;
                }
                await register(formData.username, formData.email, formData.password);
                console.log('AuthMenu.js: Registration successful, switching to login view');
                setIsLogin(true);
            }
        } catch (error) {
            console.error(`AuthMenu.js: ${isLogin ? 'Login' : 'Registration'} error:`, error);
            toast.error(error.message || `Failed to ${isLogin ? 'login' : 'register'}. Please try again.`);
        }
    };

    console.log('AuthMenu.js: Rendering component with state:', { 
        isOpen, 
        isLogin, 
        formDataExists: Object.values(formData).some(val => val.length > 0),
        loadingAuth: loading,
        menuRefExists: !!menuRef.current
    });

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={menuRef}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute right-0 top-16 w-96 bg-white rounded-lg shadow-xl overflow-hidden z-50"
                    data-testid="auth-menu"
                >
                    <div className="p-6">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                            {isLogin ? 'Welcome Back' : 'Create Account'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!isLogin && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required={!isLogin}
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                            {!isLogin && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Confirm Password
                                    </label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required={!isLogin}
                                    />
                                </div>
                            )}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {loading ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </span>
                                ) : (
                                    isLogin ? 'Sign In' : 'Create Account'
                                )}
                            </button>
                        </form>
                        <div className="mt-4 text-center">
                            <button
                                onClick={() => {
                                    console.log('AuthMenu.js: Switching form mode to:', !isLogin ? 'Login' : 'Register');
                                    setIsLogin(!isLogin);
                                }}
                                className="text-sm text-blue-600 hover:text-blue-500"
                            >
                                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

console.log('AuthMenu.js: Exporting AuthMenu component');
export default AuthMenu; 