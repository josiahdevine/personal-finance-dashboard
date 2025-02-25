import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import AskAIButton from './AskAIButton';

function Header() {
    const { currentUser, logout } = useAuth();

    const handleHelpClick = () => {
        window.location.href = 'mailto:support@example.com?subject=Help%20Request';
    };

    return (
        <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    <div className="flex items-center">
                        <Link to="/" className="text-xl font-semibold text-gray-900 hover:text-gray-700">
                            Personal Finance Dashboard
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        {currentUser ? (
                            <>
                                <div className="group relative">
                                    <AskAIButton className="opacity-75 hover:opacity-100" />
                                    <div className="hidden group-hover:block absolute right-0 top-full mt-2 w-48 bg-gray-800 text-white text-xs rounded p-2 z-50">
                                        Get AI-powered financial insights and advice
                                    </div>
                                </div>
                                
                                <button
                                    onClick={handleHelpClick}
                                    className="text-gray-500 hover:text-gray-700 transition-colors"
                                    title="Need help? Click to contact support"
                                >
                                    <QuestionMarkCircleIcon className="h-6 w-6" />
                                </button>

                                <button
                                    onClick={logout}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header; 