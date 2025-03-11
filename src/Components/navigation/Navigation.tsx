import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { IconType } from 'react-icons';
import {
  RiDashboardLine,
  RiMoneyDollarCircleLine,
  RiExchangeDollarLine,
  RiLineChartLine,
  RiBankLine,
  RiRobot2Line,
  RiBellLine,
  RiSettings4Line,
  RiCalendarTodoLine,
} from 'react-icons/ri';

export interface NavItem {
  id: string;
  title: string;
  path: string;
  icon?: IconType;
  children?: NavItem[];
  permissions?: string[];
  badge?: {
    content: string | number;
    variant: 'primary' | 'secondary' | 'danger' | 'warning' | 'success';
  };
}

interface NavigationProps {
  items?: NavItem[];
  className?: string;
  collapsed?: boolean;
  showMobileMenu?: boolean;
  onMobileMenuToggle?: () => void;
  onNavItemClick?: () => void;
}

const defaultNavItems: NavItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    path: '/dashboard',
    icon: RiDashboardLine,
  },
  {
    id: 'bills',
    title: 'Bills & Expenses',
    path: '/dashboard/bills',
    icon: RiMoneyDollarCircleLine,
  },
  {
    id: 'transactions',
    title: 'Transactions',
    path: '/dashboard/transactions',
    icon: RiExchangeDollarLine,
  },
  {
    id: 'analytics',
    title: 'Analytics',
    path: '/dashboard/analytics',
    icon: RiLineChartLine,
  },
  {
    id: 'accounts',
    title: 'Bank Accounts',
    path: '/dashboard/accounts',
    icon: RiBankLine,
  },
  {
    id: 'salary-journal',
    title: 'Salary Journal',
    path: '/dashboard/salary-journal',
    icon: RiCalendarTodoLine,
  },
  {
    id: 'ai-assistant',
    title: 'Ask AI',
    path: '/dashboard/ask-ai',
    icon: RiRobot2Line,
    badge: {
      content: 'Beta',
      variant: 'primary'
    }
  },
  {
    id: 'notifications',
    title: 'Notifications',
    path: '/dashboard/notifications',
    icon: RiBellLine,
    badge: {
      content: 3,
      variant: 'danger'
    }
  },
  {
    id: 'settings',
    title: 'Settings',
    path: '/dashboard/settings',
    icon: RiSettings4Line,
  }
];

export const Navigation: React.FC<NavigationProps> = ({
  items = defaultNavItems,
  className = '',
  collapsed = false,
  showMobileMenu = false,
  onMobileMenuToggle,
  onNavItemClick,
}) => {
  const location = useLocation();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const hasPermission = (permissions?: string[]) => {
    if (!permissions || permissions.length === 0) return true;
    return permissions.some(permission => user?.permissions?.includes(permission));
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const getBadgeStyles = (variant: string) => {
    const baseStyles = 'px-2 py-0.5 text-xs font-medium rounded-full';
    const variants = {
      primary: 'bg-primary-100 text-primary-800 dark:bg-primary-800 dark:text-primary-100',
      secondary: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
      danger: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100',
      success: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
    };
    return `${baseStyles} ${variants[variant as keyof typeof variants]}`;
  };

  const renderNavItem = (item: NavItem, depth = 0) => {
    if (!hasPermission(item.permissions)) return null;

    const isItemActive = isActive(item.path);
    const isExpanded = expandedItems.includes(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const Icon = item.icon;

    return (
      <li key={item.id} className={`${depth > 0 ? 'ml-4' : ''}`}>
        <NavLink
          to={item.path}
          className={({ isActive }) => `
            group flex items-center px-3 py-2 text-sm font-medium rounded-md
            transition-all duration-150 ease-in-out
            ${isActive
              ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/50 dark:text-primary-300'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800/50 dark:hover:text-gray-100'
            }
            ${collapsed ? 'justify-center' : ''}
          `}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id);
            }
            onNavItemClick?.();
          }}
        >
          {Icon && (
            <Icon
              className={`
                flex-shrink-0 h-5 w-5
                ${isItemActive
                  ? 'text-primary-600 dark:text-primary-300'
                  : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400'
                }
                ${collapsed ? '' : 'mr-3'}
              `}
            />
          )}
          
          {!collapsed && (
            <>
              <span className="truncate">{item.title}</span>
              {item.badge && (
                <span className={`ml-auto ${getBadgeStyles(item.badge.variant)}`}>
                  {item.badge.content}
                </span>
              )}
              {hasChildren && (
                <svg
                  className={`ml-auto h-5 w-5 transform transition-transform ${
                    isExpanded ? 'rotate-90' : ''
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </>
          )}
        </NavLink>
        {hasChildren && !collapsed && (
          <AnimatePresence>
            {isExpanded && (
              <motion.ul
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-1 space-y-1"
              >
                {item.children.map(child => renderNavItem(child, depth + 1))}
              </motion.ul>
            )}
          </AnimatePresence>
        )}
      </li>
    );
  };

  // Desktop Navigation
  const DesktopNav = (
    <nav
      className={`hidden md:block ${className}`}
      aria-label="Main navigation"
    >
      <ul className="space-y-1">
        {items.map(item => renderNavItem(item))}
      </ul>
    </nav>
  );

  // Mobile Navigation
  const MobileNav = (
    <div className="md:hidden">
      <button
        onClick={onMobileMenuToggle}
        className={`
          p-2 rounded-md transition-colors duration-150 ease-in-out
          ${isDark
            ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
            : 'text-gray-500 hover:text-gray-600 hover:bg-gray-100'
          }
          focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500
        `}
        aria-expanded={showMobileMenu}
        aria-controls="mobile-navigation"
      >
        <span className="sr-only">
          {showMobileMenu ? 'Close main menu' : 'Open main menu'}
        </span>
        {!showMobileMenu ? (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        ) : (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </button>

      <AnimatePresence>
        {showMobileMenu && isMounted && (
          <motion.nav
            id="mobile-navigation"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-gray-900 shadow-lg rounded-lg mt-2"
            aria-label="Mobile navigation"
          >
            {items.map(item => renderNavItem(item))}
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <>
      {DesktopNav}
      {MobileNav}
    </>
  );
};
