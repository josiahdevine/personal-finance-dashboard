import React, { useState, useEffect } from 'react';
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
  HiOutlineLogout,
  HiOutlineBell,
  HiOutlinePlus
} from 'react-icons/hi';

/**
 * Mobile-optimized layout component for Android and iOS devices
 * Enhanced with better touch-friendly navigation and animated transitions
 */
const MobileLayout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [hideNav, setHideNav] = useState(false);
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Handle scroll to hide/show navigation on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY + 20) {
        setHideNav(true);
      } else if (currentScrollY < lastScrollY - 20) {
        setHideNav(false);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    // Attempt to trigger haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Navigation items with updated icons and labels
  const navItems = [
    {
      name: 'Home',
      path: '/',
      icon: <HiOutlineHome className="w-6 h-6" />
    },
    {
      name: 'Income',
      path: '/salary-journal',
      icon: <HiOutlineCash className="w-6 h-6" />
    },
    {
      name: 'Expenses',
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
      icon: <HiOutlineChartBar className="w-6 h-6" />
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
      <header className="bg-white shadow-sm sticky top-0 z-30 transition-all duration-300">
        <div className="flex justify-between items-center p-4">
          <button
            onClick={toggleMenu}
            className="p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none touch-manipulation active:scale-95 transition-transform duration-150"
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
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (navigator.vibrate) navigator.vibrate(5);
              }}
              className="relative p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none active:scale-95 transition-transform duration-150"
              aria-label="Notifications"
            >
              <HiOutlineBell className="h-6 w-6" />
              <span className="absolute top-1 right-1 bg-red-500 rounded-full w-2 h-2"></span>
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none active:scale-95 transition-transform duration-150"
              aria-label="User menu"
            >
              <HiOutlineUserCircle className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Notifications Panel - conditionally rendered */}
      {showNotifications && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-25" onClick={() => setShowNotifications(false)}>
          <div 
            className="absolute right-0 top-16 w-full max-w-sm bg-white shadow-xl rounded-lg overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-bold">Notifications</h3>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              <div className="text-sm text-gray-500 py-10 text-center">
                No new notifications
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Slide-out Menu - with improved animation */}
      <div 
        className={`fixed inset-0 z-40 transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div 
          className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity duration-300"
          onClick={toggleMenu}
        ></div>
        <div className="absolute inset-y-0 left-0 max-w-xs w-full bg-white shadow-xl flex flex-col transform transition-transform duration-500">
          <div className="flex items-center justify-between px-4 py-6 border-b border-gray-200">
            <div className="font-bold text-xl text-blue-600">Finance Dashboard</div>
            <button
              onClick={toggleMenu}
              className="rounded-md text-gray-500 hover:text-gray-700 focus:outline-none active:scale-95 transition-transform duration-150"
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
                  className={`flex items-center px-4 py-3 rounded-md transition-colors duration-200 ${
                    isActive(item.path)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100'
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
                className="flex items-center w-full px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors duration-200 active:bg-gray-200"
              >
                <HiOutlineLogout className="mr-3 h-6 w-6 text-gray-400" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 pb-20">
        {children}
      </main>

      {/* Modern Mobile Bottom Navigation with FAB */}
      <div className="fixed bottom-4 right-4 z-30">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-transform duration-200 active:scale-95"
          onClick={() => navigate('/add-transaction')}
          aria-label="Add transaction"
        >
          <HiOutlinePlus className="h-6 w-6" />
        </button>
      </div>

      {/* Enhanced Mobile Bottom Navigation */}
      <nav className={`bg-white shadow-lg fixed bottom-0 left-0 right-0 z-20 transition-transform duration-300 ease-in-out ${
        hideNav ? 'translate-y-full' : 'translate-y-0'
      }`}>
        <div className="flex justify-around">
          {navItems.slice(0, 5).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-3 px-2 transition-colors duration-200 ${
                isActive(item.path)
                  ? 'text-blue-600 relative after:content-[""] after:absolute after:bottom-0 after:left-1/4 after:right-1/4 after:h-1 after:bg-blue-600 after:rounded-t-full'
                  : 'text-gray-500 hover:text-gray-900 active:text-blue-500'
              }`}
              onClick={() => {
                if (navigator.vibrate) navigator.vibrate(5);
              }}
            >
              <div className={`${isActive(item.path) ? 'scale-110' : 'scale-100'} transition-transform duration-200`}>
                {item.icon}
              </div>
              <span className="text-xs mt-1 font-medium">{item.name}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default MobileLayout; 