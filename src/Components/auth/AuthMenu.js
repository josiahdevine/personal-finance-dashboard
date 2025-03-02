import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { log, logError } from '../../utils/logger';

console.log('AuthMenu.js: Initializing AuthMenu component');

const AuthMenu = ({ isOpen, onClose }) => {
    console.log('AuthMenu.js: AuthMenu component rendering with props:', { isOpen });
    
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, register, googleSignIn } = useAuth();
    const navigate = useNavigate();

    // Log component lifecycle
    useEffect(() => {
        log('AuthMenu', 'Component mounted');
        return () => log('AuthMenu', 'Component unmounted');
    }, []);

    // Log open/close state changes
    useEffect(() => {
        log('AuthMenu', 'isOpen state changed', { isOpen });
    }, [isOpen]);

    // Log form mode changes
    useEffect(() => {
        log('AuthMenu', 'Form mode changed', { isLogin });
        // Reset form when switching modes
        setEmail('');
        setPassword('');
        setConfirmPassword('');
    }, [isLogin]);

    useEffect(() => {
        if (!isOpen) {
            onClose();
        }
    }, [isOpen, onClose]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isLogin) {
                log('AuthMenu', 'Attempting login', { email });
                await login(email, password);
                toast.success('Successfully logged in!');
                navigate('/dashboard');
            } else {
                if (password !== confirmPassword) {
                    throw new Error('Passwords do not match');
                }
                log('AuthMenu', 'Attempting registration', { email });
                await register(email, password);
                toast.success('Successfully registered! Please log in.');
                setIsLogin(true);
            }
        } catch (error) {
            logError('AuthMenu', isLogin ? 'Login failed' : 'Registration failed', error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            log('AuthMenu', 'Attempting Google sign in');
            await googleSignIn();
            toast.success('Successfully signed in with Google!');
            navigate('/dashboard');
        } catch (error) {
            logError('AuthMenu', 'Google sign in failed', error);
            toast.error(error.message);
        }
    };

    console.log('AuthMenu.js: Rendering with state:', {
        isOpen,
        isLogin,
        emailExists: email.length > 0,
        passwordExists: password.length > 0,
        confirmPasswordExists: confirmPassword.length > 0,
        loadingAuth: loading
    });

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute right-0 top-16 w-96 bg-white rounded-lg shadow-xl overflow-hidden z-50"
                    data-testid="auth-menu"
                >
                    <div className="p-6">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                            {isLogin ? 'Login' : 'Register'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
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
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
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
                                    isLogin ? 'Login' : 'Register'
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={handleGoogleSignIn}
                                className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Sign in with Google
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
                                {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
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