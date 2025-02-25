import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { HiMenu, HiX } from 'react-icons/hi';
import { log, logError } from '../utils/logger';
import { useSidebar } from '../App';

/**
 * HeaderWithAuth component conditionally renders the Header based on authentication state
 * It also logs rendering events and prevents flashing content during loading
 */
const HeaderWithAuth = () => {
  const { currentUser, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { toggleSidebar } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      log('HeaderWithAuth', 'User initiated logout');
      await logout();
      navigate('/login');
    } catch (error) {
      logError('HeaderWithAuth', 'Logout error', error);
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo and Sidebar Toggle */}
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

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
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

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                to="/"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === '/'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/salary-journal"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === '/salary-journal'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                Salary Journal
              </Link>
              <Link
                to="/bills-analysis"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === '/bills-analysis'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                Bills Analysis
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default HeaderWithAuth; 