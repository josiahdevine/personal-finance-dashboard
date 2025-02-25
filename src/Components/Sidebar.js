import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  HiOutlineChartBar, 
  HiOutlineCash, 
  HiOutlineDocumentText, 
  HiOutlineHome,
  HiOutlineQuestionMarkCircle,
  HiOutlineCreditCard,
  HiOutlineCog,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineLogout
} from 'react-icons/hi';
import { useAuth } from '../contexts/AuthContext';
import { useSidebar } from '../App';
import { log, logError } from '../utils/logger';

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
      name: 'Link Accounts',
      path: '/link-accounts',
      icon: <HiOutlineCreditCard className="w-6 h-6" />
    },
    {
      name: 'Goals',
      path: '/goals',
      icon: <HiOutlineCog className="w-6 h-6" />
    },
    {
      name: 'Ask AI',
      path: '/ask-ai',
      icon: <HiOutlineQuestionMarkCircle className="w-6 h-6" />
    }
  ];

  // Handle navigation
  const navigateTo = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  // Is current route
  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') {
      return true;
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  // Desktop sidebar
  const renderDesktopSidebar = () => (
    <div 
      className={`hidden md:flex flex-col bg-blue-900 text-white h-screen fixed left-0 top-0 z-20 transition-all duration-300 ${
        isSidebarOpen ? 'w-64' : 'w-16'
      }`}
    >
      {/* Logo section */}
      <div className="flex items-center justify-between p-4 border-b border-blue-800">
        {isSidebarOpen && (
          <div className="font-bold text-lg">Finance Dashboard</div>
        )}
        <button 
          onClick={toggleSidebar}
          className="p-1 rounded-full hover:bg-blue-800 focus:outline-none"
          aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isSidebarOpen ? (
            <HiOutlineChevronLeft className="w-5 h-5" />
          ) : (
            <HiOutlineChevronRight className="w-5 h-5" />
          )}
        </button>
      </div>
      
      {/* Navigation links */}
      <div className="flex-1 overflow-y-auto py-4">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigateTo(item.path)}
            className={`w-full flex items-center px-4 py-3 mb-1 transition-colors duration-200 ${
              isActive(item.path)
                ? 'bg-blue-800 text-white'
                : 'text-blue-300 hover:bg-blue-800 hover:text-white'
            }`}
            aria-label={item.name}
          >
            <span className="mr-3">{item.icon}</span>
            {isSidebarOpen && <span>{item.name}</span>}
          </button>
        ))}
      </div>
      
      {/* Logout button */}
      <div className="p-4 border-t border-blue-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-2 text-blue-300 hover:bg-blue-800 hover:text-white rounded transition-colors duration-200"
          aria-label="Logout"
        >
          <HiOutlineLogout className="w-6 h-6 mr-3" />
          {isSidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  // Mobile sidebar toggler
  const renderMobileToggle = () => (
    <button
      onClick={toggleMobile}
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
        onClick={() => setMobileOpen(false)}
      ></div>
      
      {/* Sidebar */}
      <div className="absolute top-0 left-0 bottom-0 w-64 bg-blue-900 text-white overflow-y-auto">
        {/* Logo section */}
        <div className="flex items-center justify-between p-4 border-b border-blue-800">
          <div className="font-bold text-lg">Finance Dashboard</div>
          <button
            onClick={() => setMobileOpen(false)}
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
              onClick={() => navigateTo(item.path)}
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
            onClick={handleLogout}
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