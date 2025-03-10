import React from 'react';
import { Badge } from './Badge';
import { useTheme } from '../../contexts/ThemeContext';
import { motion } from 'framer-motion';

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'underline' | 'pills' | 'boxed';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  align?: 'left' | 'center' | 'right';
  className?: string;
  ariaLabel?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'underline',
  size = 'md',
  align = 'left',
  className = '',
  ariaLabel = 'Navigation tabs'
}) => {
  const { isDarkMode } = useTheme();

  // Determine variant styles based on theme
  const variantStyles = {
    underline: {
      list: `border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`,
      tab: (active: boolean) => `
        relative border-b-2 ${active 
          ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' 
          : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
        }
      `,
      disabled: 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
    },
    pills: {
      list: 'space-x-1',
      tab: (active: boolean) => `
        rounded-md ${active 
          ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' 
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        }
      `,
      disabled: 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
    },
    boxed: {
      list: `border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`,
      tab: (active: boolean) => `
        rounded-t-lg border-t border-l border-r -mb-px
        ${active 
          ? `${isDarkMode ? 'bg-gray-800' : 'bg-white'} ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} text-indigo-600 dark:text-indigo-400` 
          : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}
      `,
      disabled: 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
    }
  };

  // Size styles mapping
  const sizeStyles = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-2 py-1.5 text-sm',
    md: 'px-3 py-2 text-base',
    lg: 'px-4 py-3 text-lg'
  };

  // Alignment styles mapping
  const alignStyles = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  };

  // Get the current styles based on the selected variant
  const styles = variantStyles[variant];
  const sizeStyle = sizeStyles[size];
  const alignStyle = alignStyles[align];

  return (
    <div className={className}>
      <nav aria-label={ariaLabel}>
        <ul className={`flex ${alignStyle} ${styles.list}`} role="tablist">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            const isDisabled = tab.disabled;

            return (
              <li key={tab.id} className="relative" role="presentation">
                <button
                  type="button"
                  onClick={() => !isDisabled && onChange(tab.id)}
                  disabled={isDisabled}
                  className={`
                    inline-flex items-center ${sizeStyle}
                    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                    transition-all duration-200 ease-in-out
                    ${styles.tab(isActive)}
                    ${isDisabled ? styles.disabled : ''}
                  `}
                  role="tab"
                  aria-selected={isActive}
                  aria-disabled={isDisabled}
                  aria-controls={`tab-panel-${tab.id}`}
                  id={`tab-${tab.id}`}
                >
                  {tab.icon && (
                    <span className={`${tab.label ? 'mr-2' : ''} transition-transform duration-200 ${isActive ? 'transform scale-110' : ''}`}>
                      {tab.icon}
                    </span>
                  )}
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <Badge
                      variant={isActive ? 'primary' : 'secondary'}
                      size={size === 'lg' ? 'md' : 'sm'}
                      className="ml-2"
                    >
                      {tab.badge}
                    </Badge>
                  )}
                </button>
                
                {/* Animation for the active state indicator */}
                {variant === 'underline' && isActive && (
                  <motion.div
                    className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500"
                    layoutId="activeTabIndicator"
                    initial={false}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 30,
                    }}
                  />
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}; 