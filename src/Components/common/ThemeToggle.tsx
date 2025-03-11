import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className, showLabel = false }) => {
  const { theme, setTheme } = useTheme();

  return (
    <div className={`flex items-center ${className || ''}`}>
      {showLabel && (
        <span className="mr-2 text-sm font-medium">
          {theme === 'light' 
            ? 'Light' 
            : theme === 'dark' 
              ? 'Dark' 
              : 'System'}
        </span>
      )}
      
      <div className="relative inline-flex">
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
          className="cursor-pointer appearance-none w-10 h-10 rounded-full bg-transparent border dark:border-gray-700 p-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          aria-label="Select theme"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="system">System</option>
        </select>

        <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
          {theme === 'light' && <SunIcon className="w-5 h-5" />}
          {theme === 'dark' && <MoonIcon className="w-5 h-5" />}
          {theme === 'system' && <ComputerDesktopIcon className="w-5 h-5" />}
        </span>
      </div>
    </div>
  );
};

export default ThemeToggle; 