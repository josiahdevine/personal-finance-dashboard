import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useSidebar } from '../App';
import { log, logError } from '../utils/logger';
import {
  FaHome,
  FaTachometerAlt,
  FaWallet,
  FaExchangeAlt,
  FaMoneyBillWave,
  FaCog,
  FaSignOutAlt,
  FaBell,
  FaQuestion,
  FaUserCircle,
  HiOutlineChartBar,
  HiOutlineCash,
  HiOutlineDocumentText,
  HiOutlineHome,
  HiOutlineQuestionMarkCircle,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineLogout,
  HiOutlineLink
} from '../utils/iconMapping';

function Sidebar() {
  const { logout } = useAuth();
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Close mobile sidebar when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Toggle mobile sidebar
  const toggleMobile = () => {
    setMobileOpen(!mobileOpen);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      log('Sidebar', 'User initiating logout');
      await logout();
      navigate('/login');
    } catch (error) {
      logError('Sidebar', 'Failed to log out', error);
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
      name: 'Salary Journal',
      path: '/salary-journal',
      icon: <HiOutlineCash className="w-6 h-6" />
    },
    {
      name: 'Bills Analysis',
      path: '/bills-analysis',
      icon: <HiOutlineDocumentText className="w-6 h-6" />
    },
    {
      name: 'Transactions',
      path: '/transactions',
      icon: <HiOutlineChartBar className="w-6 h-6" />
    },
    {
      name: 'Account Connections',
      path: '/link-accounts',
      icon: <HiOutlineLink className="w-6 h-6" />
    },
    {
      name: 'Goals',
      path: '/goals',
      icon: <HiOutlineQuestionMarkCircle className="w-6 h-6" />
    },
    {
      name: 'Ask AI',
      path: '/ask-ai',
      icon: <HiOutlineQuestionMarkCircle className="w-6 h-6" />
    },
    {
      name: 'Subscription',
      path: '/subscription',
      icon: <HiOutlineQuestionMarkCircle className="w-6 h-6" />
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: <FaUserCircle className="w-6 h-6" />
    }
  ];

  // Handle navigation
  const navigateTo = (path) => {
    try {
      log('Sidebar', `Navigating to ${path}`);
      navigate(path);
      setMobileOpen(false);
    } catch (error) {
      logError('Sidebar', `Failed to navigate to ${path}`, error);
    }
  };

  // Is current route
  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') {
      return true;
    }
    return location.pathname === path;
  };

  // Desktop sidebar
  const renderDesktopSidebar = () => (
    <div 
      className={`fixed top-0 left-0 h-full bg-gray-800 text-white transition-all duration-300 ease-in-out z-20 ${
        isSidebarOpen ? 'w-64' : 'w-16'
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {isSidebarOpen ? (
            <span className="text-xl font-semibold">Finance Dashboard</span>
          ) : (
            <span className="text-xl font-semibold">PF</span>
          )}
          <button 
            onClick={() => toggleSidebar()} onKeyDown={() => toggleSidebar()} role="button" tabIndex={0}
            className="p-1 rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
            aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isSidebarOpen ? (
              <HiOutlineChevronLeft className="w-5 h-5" />
            ) : (
              <HiOutlineChevronRight className="w-5 h-5" />
            )}
          </button>
        </div>
        
        <div className="flex-grow py-4 overflow-y-auto">
          <ul className="space-y-2 px-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <button
                  onClick={() => navigateTo(item.path)} onKeyDown={() => navigateTo(item.path)} role="button" tabIndex={0}
                  className={`flex items-center w-full p-2 rounded-lg transition-colors duration-200 ${
                    isActive(item.path)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-center">
                    {item.icon}
                  </div>
                  {isSidebarOpen && (
                    <span className="ml-3">{item.name}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout} onKeyDown={handleLogout} role="button" tabIndex={0}
            className="flex items-center w-full p-2 text-gray-300 rounded-lg transition-colors duration-200 hover:bg-gray-700"
          >
            <HiOutlineLogout className="w-6 h-6" />
            {isSidebarOpen && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </div>
    </div>
  );

  // Mobile sidebar toggler
  const renderMobileToggle = () => (
    <button
      onClick={toggleMobile} onKeyDown={toggleMobile} role="button" tabIndex={0}
      className="md:hidden fixed bottom-4 right-4 z-30 bg-blue-600 text-white p-3 rounded-full shadow-lg focus:outline-none"
      aria-label="Toggle mobile navigation"
    >
      {mobileOpen ? (
        <HiOutlineChevronLeft className="w-6 h-6" />
      ) : (
        <HiOutlineChevronRight className="w-6 h-6" />
      )}
    </button>
  );

  // Mobile sidebar
  const renderMobileSidebar = () => (
    <div
      className={`md:hidden fixed inset-0 z-20 transform ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out`}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={() => setMobileOpen(false)} onKeyDown={() => setMobileOpen(false)} role="button" tabIndex={0}
      ></div>
      
      {/* Sidebar */}
      <div className="absolute top-0 left-0 bottom-0 w-64 bg-blue-900 text-white overflow-y-auto">
        {/* Logo section */}
        <div className="flex items-center justify-between p-4 border-b border-blue-800">
          <div className="font-bold text-lg">Finance Dashboard</div>
          <button
            onClick={() => setMobileOpen(false)} onKeyDown={() => setMobileOpen(false)} role="button" tabIndex={0}
            className="p-1 rounded-full hover:bg-blue-800 focus:outline-none"
          >
            <HiOutlineChevronLeft className="w-5 h-5" />
          </button>
        </div>
        
        {/* Navigation links */}
        <div className="py-4">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigateTo(item.path)} onKeyDown={() => navigateTo(item.path)} role="button" tabIndex={0}
              className={`w-full flex items-center px-4 py-3 mb-1 transition-colors duration-200 ${
                isActive(item.path)
                  ? 'bg-blue-800 text-white'
                  : 'text-blue-300 hover:bg-blue-800 hover:text-white'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              <span>{item.name}</span>
            </button>
          ))}
        </div>
        
        {/* Logout button */}
        <div className="p-4 border-t border-blue-800">
          <button
            onClick={handleLogout} onKeyDown={handleLogout} role="button" tabIndex={0}
            className="w-full flex items-center px-4 py-2 text-blue-300 hover:bg-blue-800 hover:text-white rounded transition-colors duration-200"
          >
            <HiOutlineLogout className="w-6 h-6 mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {renderDesktopSidebar()}
      {renderMobileToggle()}
      {renderMobileSidebar()}
    </>
  );
}

export default Sidebar; 