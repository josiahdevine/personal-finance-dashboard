import React from 'react';
import { Badge } from './Badge';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'underline' | 'pills' | 'boxed';
  size?: 'sm' | 'md' | 'lg';
  align?: 'left' | 'center' | 'right';
  className?: string;
}

const variantStyles = {
  underline: {
    list: 'border-b border-gray-200',
    tab: (active: boolean) => `
      border-b-2 ${active ? 'border-blue-500' : 'border-transparent'}
      ${active ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}
    `,
    disabled: 'text-gray-400 cursor-not-allowed'
  },
  pills: {
    list: 'space-x-1',
    tab: (active: boolean) => `
      rounded-md ${active ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'}
    `,
    disabled: 'text-gray-400 cursor-not-allowed'
  },
  boxed: {
    list: 'border-b border-gray-200',
    tab: (active: boolean) => `
      rounded-t-lg border-t border-l border-r -mb-px
      ${active ? 'bg-white border-gray-200 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}
    `,
    disabled: 'text-gray-400 cursor-not-allowed'
  }
};

const sizeStyles = {
  sm: 'px-2 py-1 text-sm',
  md: 'px-3 py-2 text-base',
  lg: 'px-4 py-3 text-lg'
};

const alignStyles = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end'
};

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'underline',
  size = 'md',
  align = 'left',
  className = ''
}) => {
  const styles = variantStyles[variant];
  const sizeStyle = sizeStyles[size];
  const alignStyle = alignStyles[align];

  return (
    <div className={className}>
      <nav>
        <ul className={`flex ${alignStyle} ${styles.list}`}>
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            const isDisabled = tab.disabled;

            return (
              <li key={tab.id} className="relative">
                <button
                  type="button"
                  onClick={() => !isDisabled && onChange(tab.id)}
                  disabled={isDisabled}
                  className={`
                    inline-flex items-center ${sizeStyle}
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    ${styles.tab(isActive)}
                    ${isDisabled ? styles.disabled : ''}
                  `}
                  role="tab"
                  aria-selected={isActive}
                  aria-disabled={isDisabled}
                >
                  {tab.icon && (
                    <span className={`${tab.label ? 'mr-2' : ''}`}>
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
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}; 