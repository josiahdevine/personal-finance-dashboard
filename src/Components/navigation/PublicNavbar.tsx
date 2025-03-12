import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { LightIcon, DarkIcon } from '../icons/ThemeIcons';

interface PublicNavbarProps {
  className?: string;
}

export const PublicNavbar: React.FC<PublicNavbarProps> = ({ className = '' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Add window resize listener
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Add scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };
  
  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Derive styles based on theme and scroll state
  const navBackground = scrolled 
    ? isDarkMode 
      ? 'bg-gray-900 bg-opacity-95 backdrop-blur-sm shadow-lg' 
      : 'bg-white bg-opacity-95 backdrop-blur-sm shadow-lg'
    : isDarkMode
      ? 'bg-transparent' 
      : 'bg-transparent';

  const textColor = isDarkMode ? 'text-white' : 'text-gray-900';
  const linkHoverColor = isDarkMode ? 'hover:text-indigo-400' : 'hover:text-indigo-700';
  const mobileMenuBg = isDarkMode ? 'bg-gray-900' : 'bg-white';
  const borderColor = isDarkMode ? 'border-gray-700' : 'border-gray-200';

  // Show dashboard link only when user is authenticated
  const shouldShowDashboard = isAuthenticated || currentUser;

  return (
    <nav 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${navBackground} ${scrolled ? 'py-2' : 'py-4'} ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo/Brand */}
          <div className="flex-none">
            <Link to="/" className="flex items-center" onClick={closeMobileMenu}>
              <img 
                src="/logo.svg" 
                alt="Logo" 
                className="h-8 w-auto mr-2"
              />
              <span className={`text-xl font-bold ${textColor}`}>FinanceFlow</span>
            </Link>
          </div>

          {/* Desktop Navigation Links - Centered */}
          <div className={`${windowWidth < 768 ? 'hidden' : 'flex'} flex-1 justify-center`}>
            <div className="flex items-center space-x-8">
              <Link 
                to="/features" 
                className={`${textColor} font-medium ${linkHoverColor} ${location.pathname === '/features' ? 'border-b-2 border-indigo-500' : ''}`}
              >
                Features
              </Link>
              <Link 
                to="/pricing" 
                className={`${textColor} font-medium ${linkHoverColor} ${location.pathname === '/pricing' ? 'border-b-2 border-indigo-500' : ''}`}
              >
                Pricing
              </Link>
              <Link 
                to="/about" 
                className={`${textColor} font-medium ${linkHoverColor} ${location.pathname === '/about' ? 'border-b-2 border-indigo-500' : ''}`}
              >
                About
              </Link>
              {shouldShowDashboard && (
                <Link 
                  to="/dashboard" 
                  className={`${textColor} font-medium ${linkHoverColor} ${location.pathname.startsWith('/dashboard') ? 'border-b-2 border-indigo-500' : ''}`}
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>

          {/* Desktop Right Side Buttons */}
          <div className={`${windowWidth < 768 ? 'hidden' : 'flex'} flex-none items-center space-x-4`}>
            <button 
              onClick={toggleTheme} 
              className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
              aria-label="Toggle theme"
            >
              {isDarkMode ? <DarkIcon /> : <LightIcon />}
            </button>
            
            {/* Authentication Buttons */}
            {shouldShowDashboard ? (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/dashboard" 
                  className={`px-4 py-2 rounded-md ${isDarkMode ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className={`px-4 py-2 rounded-md ${isDarkMode ? 'text-white hover:bg-gray-800' : 'text-gray-900 hover:bg-gray-100'}`}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className={`px-4 py-2 rounded-md ${isDarkMode ? 'text-white hover:bg-gray-800' : 'text-gray-900 hover:bg-gray-100'}`}
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className={`px-4 py-2 rounded-md ${isDarkMode ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className={`${windowWidth >= 768 ? 'hidden' : 'flex'} items-center`}>
            <button 
              onClick={toggleTheme} 
              className={`mr-2 p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
              aria-label="Toggle theme"
            >
              {isDarkMode ? <DarkIcon /> : <LightIcon />}
            </button>
            <button 
              onClick={toggleMobileMenu}
              className={`p-2 rounded-md ${textColor} ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
              aria-label="Toggle mobile menu"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                className="h-6 w-6"
              >
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className={`md:hidden ${mobileMenuBg} border-t ${borderColor} shadow-lg`}
          >
            <div className="px-4 py-3 space-y-4">
              <Link 
                to="/features" 
                className={`block ${textColor} font-medium py-2 ${location.pathname === '/features' ? 'text-indigo-500' : ''}`}
                onClick={closeMobileMenu}
              >
                Features
              </Link>
              <Link 
                to="/pricing" 
                className={`block ${textColor} font-medium py-2 ${location.pathname === '/pricing' ? 'text-indigo-500' : ''}`}
                onClick={closeMobileMenu}
              >
                Pricing
              </Link>
              <Link 
                to="/about" 
                className={`block ${textColor} font-medium py-2 ${location.pathname === '/about' ? 'text-indigo-500' : ''}`}
                onClick={closeMobileMenu}
              >
                About
              </Link>
              {shouldShowDashboard && (
                <Link 
                  to="/dashboard" 
                  className={`block ${textColor} font-medium py-2 ${location.pathname.startsWith('/dashboard') ? 'text-indigo-500' : ''}`}
                  onClick={closeMobileMenu}
                >
                  Dashboard
                </Link>
              )}
              
              {/* Mobile Authentication Buttons */}
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                {shouldShowDashboard ? (
                  <>
                    <Link 
                      to="/dashboard" 
                      className="block w-full text-center px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 mb-2"
                      onClick={closeMobileMenu}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        closeMobileMenu();
                        handleLogout();
                      }}
                      className="block w-full text-center px-4 py-2 rounded-md bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Link 
                      to="/login" 
                      className={`block w-full text-center px-4 py-2 rounded-md ${isDarkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
                      onClick={closeMobileMenu}
                    >
                      Sign In
                    </Link>
                    <Link 
                      to="/register" 
                      className="block w-full text-center px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                      onClick={closeMobileMenu}
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};