import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Avatar } from '../ui/Avatar';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  ChartBarIcon, 
  HomeIcon, 
  CreditCardIcon, 
  UserIcon, 
  DocumentIcon, 
  BanknotesIcon,
  CogIcon,
} from '@heroicons/react/24/outline';

// Define interface for navigation items
interface NavigationItem {
  name: string;
  href: string;
  icon: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>;
  badge?: number | string;
}

// Default navigation items
const navigation: NavigationItem[] = [
  { name: 'Overview', href: '/dashboard', icon: HomeIcon },
  { name: 'Transactions', href: '/dashboard/transactions', icon: CreditCardIcon },
  { name: 'Salary Journal', href: '/dashboard/salary', icon: BanknotesIcon },
  { name: 'Bills & Subscriptions', href: '/dashboard/bills', icon: DocumentIcon },
  { name: 'Budget Planning', href: '/dashboard/budget', icon: ChartBarIcon },
  { name: 'Analytics', href: '/dashboard/analytics', icon: ChartBarIcon },
  { name: 'Cash Flow', href: '/dashboard/cash-flow', icon: ChartBarIcon },
  { name: 'Notifications', href: '/dashboard/notifications', icon: DocumentIcon, badge: 3 },
  { name: 'Ask AI', href: '/dashboard/ai', icon: UserIcon },
  { name: 'Settings', href: '/dashboard/settings', icon: CogIcon },
];

export type SidebarProps = {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
  mobileOnly?: boolean;  
  desktopOnly?: boolean; 
};

export const Sidebar: React.FC<SidebarProps> = ({ 
  className = "", 
  isOpen = false,
  onClose = () => {},
  mobileOnly = false,
  desktopOnly = false
}) => {
  const { currentUser, logout } = useAuth();
  const { theme } = useTheme();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(isOpen);
  const isDarkMode = theme === 'dark';

  // Use the isOpen prop to control the mobile menu state
  useEffect(() => {
    setIsMobileMenuOpen(isOpen);
  }, [isOpen]);

  // Handle closing the mobile menu
  const handleCloseMobileMenu = () => {
    setIsMobileMenuOpen(false);
    onClose();
  };

  // Animation variants for the mobile menu button
  const buttonVariants = {
    open: { rotate: 0 },
    closed: { rotate: 180 },
  };

  // Add a window size hook for responsive behavior
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      // Close the mobile menu on larger screens
      if (window.innerWidth >= 768 && isMobileMenuOpen) {
        handleCloseMobileMenu();
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMenuOpen]);

  // Derive background and text colors based on theme
  const bgColor = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const textColor = isDarkMode ? 'text-white' : 'text-gray-900';
  const borderColor = isDarkMode ? 'border-gray-700' : 'border-gray-200';

  // Function to determine if a link is active
  const isActive = (href: string) => {
    // Handle dashboard root path
    if (href === '/dashboard' && location.pathname === '/dashboard') {
      return true;
    }
    
    // For all other paths, check if the current path starts with the href
    // but only if href is not the dashboard root (to avoid dashboard being active for all sub-routes)
    if (href !== '/dashboard') {
      return location.pathname.startsWith(href);
    }
    
    return false;
  };

  return (
    <>
      {/* Mobile menu toggle button */}
      <AnimatePresence>
        {mobileOnly && (
          <motion.button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`
              fixed top-4 left-4 p-2 rounded-md z-40 md:hidden
              ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}
              ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}
              shadow-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}
            `}
            animate={isMobileMenuOpen ? "open" : "closed"}
            variants={buttonVariants}
            transition={{ duration: 0.2 }}
            aria-label="Toggle menu"
            initial={false}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Mobile overlay when menu is open */}
      <AnimatePresence>
        {(isMobileMenuOpen || isOpen) && windowWidth < 768 && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleCloseMobileMenu}
          />
        )}
      </AnimatePresence>

      {/* Sidebar with Framer Motion animations */}
      <motion.div 
        className={`
          fixed inset-y-0 left-0 w-64 shadow-xl z-30 transition-all duration-200
          ${bgColor} ${textColor} ${borderColor} ${className}
          ${desktopOnly ? 'hidden md:block md:static' : ''}
          ${mobileOnly ? 'md:hidden' : ''}
          ${!mobileOnly && !desktopOnly ? 'md:static' : ''}
        `}
        animate={{ 
          x: (isMobileMenuOpen || isOpen) || windowWidth >= 768 ? 0 : -256 // 256px = w-64
        }}
        initial={{ 
          x: windowWidth >= 768 ? 0 : -256 
        }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 30 
        }}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 bg-indigo-600 text-white">
            <Link to="/" className="flex items-center space-x-2">
              <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" />
                <path d="M15 9C15 7.34315 13.6569 6 12 6C10.3431 6 9 7.34315 9 9C9 10.6569 10.3431 12 12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M12 12V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="text-xl font-bold tracking-tight">
                FinanceDash
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActiveItem = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={handleCloseMobileMenu}
                  className={`
                    group relative flex items-center px-2 py-2 text-sm font-medium rounded-md
                    transition-all duration-200 ease-in-out
                    ${isActiveItem 
                      ? `bg-indigo-900 bg-opacity-20 text-indigo-500` 
                      : `text-gray-600 hover:bg-gray-50`
                    }
                  `}
                  aria-current={isActiveItem ? 'page' : undefined}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200
                      ${isActiveItem ? 'text-indigo-500' : 'text-gray-500'}
                      group-hover:text-gray-500
                    `}
                    aria-hidden="true"
                  />
                  <span className="flex-1">{item.name}</span>
                  
                  {/* Badge for notifications or other indicators */}
                  {item.badge && (
                    <span className={`
                      ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                      ${isActiveItem ? 'bg-indigo-200 text-indigo-800' : 'bg-gray-200 text-gray-800'}
                      ${isDarkMode && !isActiveItem ? 'bg-gray-700 text-gray-200' : ''}
                    `}>
                      {item.badge}
                    </span>
                  )}
                  
                  {/* Active indicator with animation */}
                  {isActiveItem && (
                    <motion.div
                      layoutId="active-nav"
                      className="absolute inset-y-0 left-0 w-1 bg-indigo-500 rounded-r-md"
                      initial={false}
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile with enhanced styling */}
          <div className={`flex-shrink-0 p-4 border-t ${borderColor}`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Avatar />
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${textColor}`}>
                  {currentUser?.name || currentUser?.email}
                </p>
                <button
                  onClick={() => logout()}
                  className={`text-xs font-medium flex items-center mt-1 
                    transition-colors duration-200
                    ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                  aria-label="Sign out"
                >
                  <svg
                    className="h-4 w-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}; 