import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { ThemeMode } from '../../types/theme';

export interface HeaderProps {
  theme: ThemeMode;
  onThemeToggle: () => void;
  _onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ theme, onThemeToggle, _onMenuClick }) => {
  const navigate = useNavigate();
  const { isAuthenticated, signInWithEmail, signOut } = useAuth();
  const [showLoginMenu, setShowLoginMenu] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmail(email, password);
      setShowLoginMenu(false);
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Close login menu when clicking outside
  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.login-menu') && !target.closest('.login-button')) {
      setShowLoginMenu(false);
    }
  };

  React.useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isDark = theme === 'dark';

  return (
    <header className={`fixed w-full z-50 ${isDark ? 'bg-gray-900' : 'bg-white'} shadow-lg`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <button
                onClick={() => navigate('/')}
                className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
              >
                FinanceDash
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={onThemeToggle}
              className={`p-2 rounded-lg ${
                isDark
                  ? 'text-gray-400 hover:text-white'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <SunIcon className="h-6 w-6" />
              ) : (
                <MoonIcon className="h-6 w-6" />
              )}
            </button>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className={`px-4 py-2 rounded-md ${
                    isDark
                      ? 'text-white hover:bg-gray-700'
                      : 'text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className={`px-4 py-2 rounded-md ${
                    isDark
                      ? 'text-white hover:bg-gray-700'
                      : 'text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <button
                    onClick={() => setShowLoginMenu(!showLoginMenu)}
                    className={`login-button px-4 py-2 rounded-md ${
                      isDark
                        ? 'text-white hover:bg-gray-700'
                        : 'text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    Sign In
                  </button>
                  {showLoginMenu && (
                    <div className={`login-menu absolute right-0 top-12 w-80 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4 z-50`}>
                      <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                          <label htmlFor="email" className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                            Email
                          </label>
                          <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`mt-1 block w-full rounded-md ${
                              isDark 
                                ? 'bg-gray-700 text-white border-gray-600 focus:border-indigo-500' 
                                : 'bg-white text-gray-900 border-gray-300 focus:border-indigo-500'
                            } shadow-sm focus:ring-indigo-500 sm:text-sm`}
                          />
                        </div>
                        <div>
                          <label htmlFor="password" className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                            Password
                          </label>
                          <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`mt-1 block w-full rounded-md ${
                              isDark 
                                ? 'bg-gray-700 text-white border-gray-600 focus:border-indigo-500' 
                                : 'bg-white text-gray-900 border-gray-300 focus:border-indigo-500'
                            } shadow-sm focus:ring-indigo-500 sm:text-sm`}
                          />
                        </div>
                        <div className="flex flex-col space-y-2">
                          <button
                            type="submit"
                            className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Sign In
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => navigate('/register')}
                  className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}; 