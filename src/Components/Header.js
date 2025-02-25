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
import { log, logError } from '../utils/logger';
import { HiMenu, HiX, HiOutlineLogout, HiOutlineHome, HiOutlineCurrencyDollar, HiOutlineDocumentText, HiOutlineLink, HiOutlineChartBar } from 'react-icons/hi';

function Header() {
    const { currentUser, logout } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // Close menus when route changes
    useEffect(() => {
        setMobileMenuOpen(false);
        setIsMenuOpen(false);
    }, [location.pathname]);

    const handleHelpClick = () => {
        window.location.href = 'mailto:support@example.com?subject=Help%20Request';
    };

    const handleLogout = async () => {
        try {
            log('Header', 'User initiated logout');
            await logout();
            navigate('/login');
        } catch (error) {
            logError('Header', 'Logout error', error);
            console.error('Logout failed:', error);
        }
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    const navigateTo = (path) => {
        closeMenu();
        closeSidebar();
        navigate(path);
    };

    const menuItems = [
        { name: 'Dashboard', path: '/', icon: HiOutlineHome },
        { name: 'Salary Journal', path: '/salary-journal', icon: HiOutlineCurrencyDollar },
        { name: 'Bills Analysis', path: '/bills-analysis', icon: HiOutlineChartBar },
        { name: 'Financial Goals', path: '/goals', icon: HiOutlineDocumentText },
        { name: 'Link Accounts', path: '/link-accounts', icon: HiOutlineLink },
    ];

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    {/* Logo */}
                    <div className="flex items-center">
                        {/* Sidebar Toggle Button */}
                        <button
                            className="p-2 mr-3 rounded-md hover:bg-gray-100 text-gray-700 focus:outline-none"
                            onClick={toggleSidebar}
                            aria-label="Toggle sidebar"
                        >
                            <HiMenu className="h-6 w-6" />
                        </button>
                        
                        {/* Logo/App Name */}
                        <Link 
                            to="/" 
                            className="text-xl font-semibold text-gray-900 hover:text-gray-700"
                        >
                            Personal Finance Dashboard
                        </Link>
                    </div>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex md:items-center md:space-x-4">
                        {menuItems.map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`px-3 py-2 rounded-md text-sm font-medium ${
                                    location.pathname === item.path
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                            >
                                <item.icon className="inline-block w-5 h-5 mr-1" />
                                <span>{item.name}</span>
                            </Link>
                        ))}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={toggleMenu}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
                        >
                            {isMenuOpen ? (
                                <HiX className="block h-6 w-6" />
                            ) : (
                                <HiMenu className="block h-6 w-6" />
                            )}
                        </button>
                    </div>

                    {/* User Menu */}
                    <div className="hidden md:block">
                        <button
                            onClick={handleLogout}
                            className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {menuItems.map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`block px-3 py-2 rounded-md text-base font-medium ${
                                    location.pathname === item.path
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                                onClick={closeMenu}
                            >
                                <item.icon className="inline-block w-5 h-5 mr-2" />
                                {item.name}
                            </Link>
                        ))}
                        <button
                            onClick={handleLogout}
                            className="mt-2 w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-100"
                        >
                            <HiOutlineLogout className="inline-block w-5 h-5 mr-2" />
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </header>
    );
}

export default Header; 