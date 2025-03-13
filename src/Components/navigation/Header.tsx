import React from 'react';
import { Link } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { Button } from '../ui/button';
import { CommandMenu } from './CommandMenu';
import { cn } from '../../lib/utils';
import { useTheme } from '../../contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import { MobileMenu } from './MobileMenu';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';

  // Keyboard shortcut handler for Command Menu
  const handleCommandShortcut = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
    }
  };

  React.useEffect(() => {
    document.addEventListener('keydown', handleCommandShortcut);
    return () => {
      document.removeEventListener('keydown', handleCommandShortcut);
    };
  }, []);

  const handleThemeToggle = () => {
    toggleTheme();
  };

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm dark:bg-gray-900 dark:border-gray-800",
      className
    )}>
      <div className="container flex items-center justify-between h-16 px-4 mx-auto">
        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center space-x-2"
          aria-label="FinanceDash Home"
          tabIndex={0}
        >
          <span className="text-xl font-bold text-primary">FinanceDash</span>
        </Link>

        {/* Command Menu - Center position for desktop only */}
        {!isMobile && (
          <div className="hidden md:flex items-center justify-center flex-1">
            <Button 
              variant="outline" 
              className="w-64 justify-start text-sm text-muted-foreground" 
              onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
            >
              <span>Search...</span>
              <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
          </div>
        )}
        
        {/* Desktop Navigation */}
        {!isMobile ? (
          <div className="flex items-center space-x-4">
            <nav className="hidden md:flex items-center space-x-6 mr-4">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-primary-light font-medium"
                aria-label="Home"
                tabIndex={0}
              >
                Home
              </Link>
              <Link 
                to="/features" 
                className="text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-primary-light font-medium"
                aria-label="Features"
                tabIndex={0}
              >
                Features
              </Link>
              <Link 
                to="/pricing" 
                className="text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-primary-light font-medium"
                aria-label="Pricing"
                tabIndex={0}
              >
                Pricing
              </Link>
              <Link 
                to="/demo" 
                className="text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-primary-light font-medium"
                aria-label="Demo"
                tabIndex={0}
              >
                Demo
              </Link>
            </nav>

            {/* Theme toggle button */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleThemeToggle}
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              tabIndex={0}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {/* Auth buttons */}
            <Button 
              variant="outline" 
              asChild
              className="font-medium"
            >
              <Link 
                to="/login"
                aria-label="Log in to your account"
                tabIndex={0}
              >
                Log In
              </Link>
            </Button>
            <Button 
              asChild
              className="font-medium bg-primary hover:bg-primary/90"
            >
              <Link 
                to="/register"
                aria-label="Get started with FinanceDash"
                tabIndex={0}
              >
                Get Started
              </Link>
            </Button>
          </div>
        ) : (
          <MobileMenu />
        )}
      </div>
      
      {/* Global command menu */}
      <CommandMenu />
    </header>
  );
};

export default Header; 