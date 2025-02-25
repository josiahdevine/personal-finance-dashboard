import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  QuestionMarkCircleIcon, 
  Bars3Icon, 
  XMarkIcon, 
  HomeIcon, 
  ChartBarIcon, 
  BanknotesIcon, 
  DocumentTextIcon, 
  ArrowPathIcon,
  CurrencyDollarIcon,
  UserIcon 
} from '@heroicons/react/24/outline';
import AskAIButton from './AskAIButton';
import { log } from '../utils/logger';

function Header() {
    const { currentUser, logout } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // Close menus when route changes
    useEffect(() => {
        setMobileMenuOpen(false);
        setDesktopMenuOpen(false);
    }, [location.pathname]);

    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (desktopMenuOpen && !event.target.closest('.desktop-menu-container')) {
                setDesktopMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [desktopMenuOpen]);

    const handleHelpClick = () => {
        window.location.href = 'mailto:support@example.com?subject=Help%20Request';
    };

    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            log('Header', 'Logout error', error);
        }
    };

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
        { name: 'Link Accounts', href: '/link-accounts', icon: BanknotesIcon },
        { name: 'Transactions', href: '/transactions', icon: ArrowPathIcon },
        { name: 'Salary Journal', href: '/salary-journal', icon: CurrencyDollarIcon },
        { name: 'Bills Analysis', href: '/bills-analysis', icon: ChartBarIcon },
        { name: 'Financial Goals', href: '/goals', icon: DocumentTextIcon },
    ];

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    {/* Logo */}
                    <div className="flex items-center">
                        {currentUser ? (
                            <Link to="/dashboard" className="text-xl font-semibold text-gray-900 hover:text-gray-700">
                                Personal Finance Dashboard
                            </Link>
                        ) : (
                            <Link to="/" className="text-xl font-semibold text-gray-900 hover:text-gray-700">
                                Personal Finance Dashboard
                            </Link>
                        )}
                    </div>

                    {/* Mobile hamburger menu button */}
                    {currentUser && (
                        <div className="md:hidden">
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="bg-blue-100 hover:bg-blue-200 p-2 rounded-md text-blue-600 transition-colors"
                                aria-label="Toggle mobile menu"
                            >
                                {mobileMenuOpen ? (
                                    <XMarkIcon className="h-6 w-6" />
                                ) : (
                                    <Bars3Icon className="h-6 w-6" />
                                )}
                            </button>
                        </div>
                    )}

                    {/* Desktop navigation buttons */}
                    <div className="hidden md:flex md:items-center md:space-x-4">
                        {currentUser && (
                            <div className="relative desktop-menu-container">
                                <button 
                                    onClick={() => setDesktopMenuOpen(!desktopMenuOpen)}
                                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                                        desktopMenuOpen 
                                            ? 'bg-blue-500 text-white' 
                                            : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                    } transition-colors`}
                                >
                                    <Bars3Icon className="mr-2 h-5 w-5" />
                                    <span>Menu</span>
                                </button>
                                
                                {/* Desktop dropdown menu */}
                                {desktopMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                        <div className="py-1">
                                            {navigation.map((item) => (
                                                <Link
                                                    key={item.name}
                                                    to={item.href}
                                                    className={`flex items-center px-4 py-3 text-sm ${
                                                        isActive(item.href)
                                                            ? 'bg-blue-50 text-blue-700'
                                                            : 'text-gray-700 hover:bg-gray-100'
                                                    }`}
                                                >
                                                    <item.icon className="mr-3 h-5 w-5" />
                                                    <span>{item.name}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

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
                                    className="text-gray-500 hover:text-gray-700 transition-colors p-2"
                                    title="Need help? Click to contact support"
                                >
                                    <QuestionMarkCircleIcon className="h-6 w-6" />
                                </button>

                                <div className="relative group">
                                    <button className="flex items-center space-x-1 text-gray-700 hover:text-gray-900">
                                        <UserIcon className="h-6 w-6" />
                                    </button>
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                </div>
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

                    {/* Mobile menu alternative buttons */}
                    <div className="md:hidden flex items-center space-x-2">
                        {currentUser && !mobileMenuOpen && (
                            <>
                                <AskAIButton className="opacity-75 hover:opacity-100" />
                                <button
                                    onClick={handleLogout}
                                    className="inline-flex items-center p-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                                >
                                    <UserIcon className="h-5 w-5" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile navigation menu */}
            {currentUser && mobileMenuOpen && (
                <nav className="md:hidden bg-white border-t border-gray-200 shadow-md">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`flex items-center px-3 py-3 rounded-md text-base font-medium ${
                                    isActive(item.href)
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <item.icon className="mr-3 h-5 w-5" />
                                {item.name}
                            </Link>
                        ))}
                        <div className="pt-2 border-t border-gray-200">
                            <button
                                onClick={handleLogout}
                                className="flex w-full items-center px-3 py-3 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Logout
                            </button>
                        </div>
                    </div>
                </nav>
            )}
        </header>
    );
}

export default Header; 