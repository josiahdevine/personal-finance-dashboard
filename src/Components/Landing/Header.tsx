import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { motion } from 'framer-motion';

interface HeaderProps {
  transparent?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ transparent = false }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const headerClasses = `fixed top-0 w-full z-50 transition-all duration-300 ${
    isScrolled || !transparent
      ? isDarkMode
        ? 'bg-gray-900 shadow-md shadow-gray-800/20'
        : 'bg-white shadow-md shadow-gray-200/20'
      : 'bg-transparent'
  }`;

  const textClasses = isScrolled || !transparent
    ? isDarkMode ? 'text-white' : 'text-gray-800'
    : isDarkMode ? 'text-white' : 'text-gray-800';

  const logoVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } }
  };

  const navItemVariants = {
    hover: { y: -2, transition: { duration: 0.2 } }
  };

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.98, transition: { duration: 0.1 } }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className={headerClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <motion.div 
            className="flex-shrink-0" 
            variants={logoVariants}
            whileHover="hover"
          >
            <Link to="/" className="flex items-center">
              <span className={`text-2xl font-bold ${textClasses}`}>FinanceDash</span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <motion.div variants={navItemVariants} whileHover="hover">
              <Link 
                to="/features" 
                className={`${textClasses} hover:text-blue-500 px-3 py-2 text-sm font-medium ${
                  isActive('/features') ? 'border-b-2 border-blue-500' : ''
                }`}
              >
                Features
              </Link>
            </motion.div>
            <motion.div variants={navItemVariants} whileHover="hover">
              <Link 
                to="/pricing" 
                className={`${textClasses} hover:text-blue-500 px-3 py-2 text-sm font-medium ${
                  isActive('/pricing') ? 'border-b-2 border-blue-500' : ''
                }`}
              >
                Pricing
              </Link>
            </motion.div>
            <motion.div variants={navItemVariants} whileHover="hover">
              <Link 
                to="/about" 
                className={`${textClasses} hover:text-blue-500 px-3 py-2 text-sm font-medium ${
                  isActive('/about') ? 'border-b-2 border-blue-500' : ''
                }`}
              >
                About
              </Link>
            </motion.div>
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full ${
                isDarkMode 
                  ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
            <Link to="/login">
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  isDarkMode 
                    ? 'bg-gray-800 text-white hover:bg-gray-700' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                Sign In
              </motion.button>
            </Link>
            <Link to="/register">
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700"
              >
                Get Started
              </motion.button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`${textClasses} p-2 rounded-md focus:outline-none`}
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className={`px-2 pt-2 pb-3 space-y-1 sm:px-3 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
          <Link 
            to="/features" 
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/features') 
                ? 'bg-blue-500 text-white' 
                : `${textClasses} hover:bg-gray-100 dark:hover:bg-gray-800`
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Features
          </Link>
          <Link 
            to="/pricing" 
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/pricing') 
                ? 'bg-blue-500 text-white' 
                : `${textClasses} hover:bg-gray-100 dark:hover:bg-gray-800`
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Pricing
          </Link>
          <Link 
            to="/about" 
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/about') 
                ? 'bg-blue-500 text-white' 
                : `${textClasses} hover:bg-gray-100 dark:hover:bg-gray-800`
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            About
          </Link>
          <Link 
            to="/login" 
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/login') 
                ? 'bg-blue-500 text-white' 
                : `${textClasses} hover:bg-gray-100 dark:hover:bg-gray-800`
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Sign In
          </Link>
          <Link 
            to="/register" 
            className="block px-3 py-2 rounded-md text-base font-medium bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Get Started
          </Link>
          
          <button
            onClick={() => {
              toggleTheme();
              setIsMobileMenuOpen(false);
            }}
            className={`w-full mt-2 flex items-center justify-between px-3 py-2 rounded-md text-base font-medium ${
              isDarkMode 
                ? 'bg-gray-800 text-white' 
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            {isDarkMode ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
