import React, { createContext, useContext, useState } from 'react';
import theme from '../styles/theme';

// Create the context
const ThemeContext = createContext();

// Hook for using the theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Theme provider component
export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('light');
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Add any theme-switching logic here if needed
  const toggleTheme = () => {
    setCurrentTheme(currentTheme === 'light' ? 'dark' : 'light');
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('theme', !isDarkMode ? 'dark' : 'light');
  };
  
  const themeValues = {
    ...theme,
    current: currentTheme,
    toggleTheme,
    isDarkMode,
    // Theme values used throughout the app
    values: {
      primary: isDarkMode ? '#1a56db' : '#1a56db',
      secondary: isDarkMode ? '#9061f9' : '#6366f1',
      success: isDarkMode ? '#0e9f6e' : '#059669',
      danger: isDarkMode ? '#e02424' : '#dc2626',
      warning: isDarkMode ? '#d03801' : '#d97706',
      info: isDarkMode ? '#3f83f8' : '#60a5fa',
    }
  };
  
  return (
    <ThemeContext.Provider value={themeValues}>
      {children}
    </ThemeContext.Provider>
  );
};

// Export reusable UI components that use the theme
export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const { components } = useTheme();
  const buttonClasses = `${components.button.base} ${components.button[variant]} ${components.button.sizes[size]} ${className}`;
  
  return (
    <button className={buttonClasses} {...props}>
      {children}
    </button>
  );
};

export const Card = ({ 
  children, 
  variant = 'base', 
  className = '', 
  hover = false,
  ...props 
}) => {
  const { components } = useTheme();
  const cardClasses = `${components.card[variant]} ${hover ? components.card.hover : ''} ${className}`;
  
  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

export const FormInput = ({ 
  error, 
  disabled, 
  className = '', 
  ...props 
}) => {
  const { components } = useTheme();
  let inputClasses = components.input.base;
  
  if (error) {
    inputClasses = components.input.error;
  } else if (disabled) {
    inputClasses = components.input.disabled;
  }
  
  return (
    <input 
      className={`${inputClasses} ${className}`} 
      disabled={disabled} 
      {...props} 
    />
  );
};

// Alert component for displaying notifications
export const Alert = ({ 
  children, 
  variant = 'info', 
  className = '', 
  onClose,
  ...props 
}) => {
  // Define alert styles based on variant
  const alertStyles = {
    info: `bg-blue-50 text-blue-800 border border-blue-200`,
    success: `bg-green-50 text-green-800 border border-green-200`,
    warning: `bg-yellow-50 text-yellow-800 border border-yellow-200`,
    danger: `bg-red-50 text-red-800 border border-red-200`,
  };
  
  return (
    <div 
      className={`p-4 rounded-md ${alertStyles[variant] || alertStyles.info} ${className}`}
      role="alert"
      {...props}
    >
      <div className="flex items-center">
        <div className="flex-1">{children}</div>
        {onClose && (
          <button 
            onClick={onClose}
            className="ml-auto text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <span className="text-xl">&times;</span>
          </button>
        )}
      </div>
    </div>
  );
};

// Helper function to get theme-based tailwind classes
export const getThemeClasses = (type, variant, theme) => {
  if (!theme || !theme.components || !theme.components[type]) {
    console.warn(`Theme component type '${type}' not found`);
    return '';
  }
  
  if (!theme.components[type][variant]) {
    console.warn(`Theme component variant '${variant}' not found for type '${type}'`);
    return theme.components[type].base || '';
  }
  
  return theme.components[type][variant];
};

export default ThemeContext; 