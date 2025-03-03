import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Tabs component for organizing content into tabbed sections
 * 
 * @component
 * @example
 * ```jsx
 * <Tabs 
 *   tabs={[
 *     { id: 'overview', label: 'Overview' },
 *     { id: 'transactions', label: 'Transactions' },
 *     { id: 'settings', label: 'Settings' }
 *   ]} 
 *   activeTab="overview"
 *   onTabChange={setActiveTab}
 * >
 *   {(activeTab) => (
 *     <>
 *       {activeTab === 'overview' && <OverviewPanel />}
 *       {activeTab === 'transactions' && <TransactionsPanel />}
 *       {activeTab === 'settings' && <SettingsPanel />}
 *     </>
 *   )}
 * </Tabs>
 */
const Tabs = ({
  tabs,
  activeTab,
  onTabChange,
  align = 'left',
  size = 'md',
  variant = 'underline',
  className = '',
  children,
}) => {
  const [currentTab, setCurrentTab] = useState(activeTab || (tabs[0] && tabs[0].id));

  useEffect(() => {
    if (activeTab !== undefined && activeTab !== currentTab) {
      setCurrentTab(activeTab);
    }
  }, [activeTab]);

  const handleTabChange = useCallback((tabId) => {
    setCurrentTab(tabId);
    if (onTabChange) {
      onTabChange(tabId);
    }
  }, [onTabChange]);

  // Size variants
  const sizeClasses = {
    sm: 'text-sm py-2 px-3',
    md: 'text-base py-3 px-4',
    lg: 'text-lg py-4 px-6',
  };
  
  // Alignment variants
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    stretch: 'justify-between',
  };
  
  // Tab variant styles
  const variantStyles = {
    underline: {
      list: 'border-b border-gray-200',
      tab: 'border-b-2 border-transparent',
      active: 'border-blue-500 text-blue-600',
      inactive: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
    },
    pills: {
      list: 'space-x-2',
      tab: 'rounded-md',
      active: 'bg-blue-100 text-blue-700',
      inactive: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
    },
    boxed: {
      list: 'border-b border-gray-200',
      tab: 'border-t border-l border-r border-transparent rounded-t-md',
      active: 'bg-white border-gray-200 border-b-white text-blue-600',
      inactive: 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50',
    },
  };
  
  const currentVariant = variantStyles[variant] || variantStyles.underline;
  const currentSize = sizeClasses[size] || sizeClasses.md;
  const currentAlign = alignClasses[align] || alignClasses.left;

  return (
    <div className={`w-full ${className}`}>
      <div className="border-b border-gray-200">
        <nav className={`flex ${currentAlign} -mb-px`}>
          {tabs.map((tab) => {
            const isActive = tab.id === currentTab;
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)} onKeyDown={() => handleTabChange(tab.id)} role="button" tabIndex={0}
                className={`
                  ${currentSize}
                  ${currentVariant.tab}
                  ${isActive ? currentVariant.active : currentVariant.inactive}
                  font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  transition duration-150 ease-in-out
                  ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
                disabled={tab.disabled}
                aria-selected={isActive}
                role="tab"
                aria-controls={`panel-${tab.id}`}
                id={`tab-${tab.id}`}
              >
                {tab.icon && (
                  <span className={`${tab.label ? 'mr-2' : ''} inline-block`}>
                    {tab.icon}
                  </span>
                )}
                {tab.label}
                {tab.badge && (
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
      
      <div className="mt-4" role="tabpanel" aria-labelledby={`tab-${currentTab}`} id={`panel-${currentTab}`}>
        {typeof children === 'function' ? children(currentTab) : children}
      </div>
    </div>
  );
};

Tabs.propTypes = {
  /** Array of tab objects with id, label, and optional icon and badge */
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string,
      icon: PropTypes.node,
      badge: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      disabled: PropTypes.bool,
    })
  ).isRequired,
  /** ID of the currently active tab */
  activeTab: PropTypes.string,
  /** Callback fired when tab changes, receives tab id as argument */
  onTabChange: PropTypes.func,
  /** Horizontal alignment of tabs - 'left', 'center', 'right', or 'stretch' */
  align: PropTypes.oneOf(['left', 'center', 'right', 'stretch']),
  /** Size of the tabs - 'sm', 'md', or 'lg' */
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  /** Visual style of the tabs - 'underline', 'pills', or 'boxed' */
  variant: PropTypes.oneOf(['underline', 'pills', 'boxed']),
  /** Additional CSS classes to apply to the tabs container */
  className: PropTypes.string,
  /** 
   * Children can be either static content or a render function 
   * that receives the active tab ID as an argument
   */
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.func,
  ]).isRequired,
};

export default Tabs; 