import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

function Header() {
    const { user, logout } = useContext(AuthContext);

    const handleHelpClick = () => {
        window.location.href = 'mailto:support@example.com?subject=Help%20Request';
    };

    return (
        <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    <div className="flex items-center">
                        <h1 className="text-xl font-semibold text-gray-900">
                            Welcome, {user?.name || 'User'}
                        </h1>
                    </div>

                    <div className="flex items-center space-x-4">
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
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header; 