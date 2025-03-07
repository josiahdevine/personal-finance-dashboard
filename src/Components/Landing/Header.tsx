import React from 'react';

interface HeaderProps {
  theme: 'light' | 'dark' | 'system';
  onThemeToggle: () => void;
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ theme, onThemeToggle, onMenuClick }) => {
  return (
    <header className={`fixed w-full z-50 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <img 
            src={theme === 'dark' ? '/logo-white.svg' : '/logo.svg'} 
            alt="FinTrack Logo" 
            className="h-8"
          />
          <span className={`ml-2 font-bold text-xl ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            FinTrack
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={onThemeToggle}
            className={`p-2 rounded-full ${theme === 'dark' ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-700'}`}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          
          {/* Mobile menu button */}
          {onMenuClick && (
            <button 
              onClick={onMenuClick}
              className={`p-2 rounded-md md:hidden ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          
          <nav className="hidden md:flex space-x-8">
            <a href="#features" className={`${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>Features</a>
            <a href="#pricing" className={`${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>Pricing</a>
            <a href="#testimonials" className={`${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>Testimonials</a>
          </nav>
          
          <div className="hidden md:flex space-x-2">
            <button className={`px-4 py-2 rounded-md ${theme === 'dark' ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>
              Login
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}; 