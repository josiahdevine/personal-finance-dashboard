import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  HiOutlineHome, 
  HiOutlineCash, 
  HiOutlineDocumentText, 
  HiOutlineChartBar,
  HiOutlineLink,
  HiOutlineCog,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineUserCircle,
  HiOutlineLogout
} from 'react-icons/hi';

/**
 * Mobile-optimized layout component for Android and iOS devices
 */
const MobileLayout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Navigation items
  const navItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: <HiOutlineHome className="w-6 h-6" />
    },
    {
      name: 'Salary',
      path: '/salary-journal',
      icon: <HiOutlineCash className="w-6 h-6" />
    },
    {
      name: 'Bills',
      path: '/bills-analysis',
      icon: <HiOutlineDocumentText className="w-6 h-6" />
    },
    {
      name: 'Accounts',
      path: '/link-accounts',
      icon: <HiOutlineLink className="w-6 h-6" />
    },
    {
      name: 'Goals',
      path: '/goals',
      icon: <HiOutlineCog className="w-6 h-6" />
    }
  ];

  // Check if current route is active
  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') {
      return true;
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Mobile Top Bar */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="flex justify-between items-center p-4">
          <button
            onClick={toggleMenu}
            className="p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
            aria-label="Open menu"
          >
            {isMenuOpen ? (
              <HiOutlineX className="h-6 w-6" />
            ) : (
              <HiOutlineMenu className="h-6 w-6" />
            )}
          </button>
          
          <Link to="/" className="text-xl font-semibold text-blue-600">
            Finance Dashboard
          </Link>
          
          <div className="relative">
            <button
              className="flex items-center text-gray-700 hover:text-blue-600 focus:outline-none"
              aria-label="User menu"
            >
              <HiOutlineUserCircle className="h-7 w-7" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-out Menu */}
      <div 
        className={`fixed inset-0 z-40 transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="absolute inset-0 bg-gray-500 bg-opacity-75" onClick={toggleMenu}></div>
        <div className="absolute inset-y-0 left-0 max-w-xs w-full bg-white shadow-xl flex flex-col">
          <div className="flex items-center justify-between px-4 py-6 border-b border-gray-200">
            <div className="font-bold text-xl text-blue-600">Finance Dashboard</div>
            <button
              onClick={toggleMenu}
              className="rounded-md text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label="Close menu"
            >
              <HiOutlineX className="h-6 w-6" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto pt-5 pb-4">
            <nav className="flex-1 px-2 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-md ${
                    isActive(item.path)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={toggleMenu}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span className="text-base font-medium">{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>
          
          {currentUser && (
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md"
              >
                <HiOutlineLogout className="mr-3 h-6 w-6 text-gray-400" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 pb-16">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="bg-white shadow-lg fixed bottom-0 left-0 right-0 z-20">
        <div className="flex justify-around">
          {navItems.slice(0, 5).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-3 px-2 ${
                isActive(item.path)
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default MobileLayout; 