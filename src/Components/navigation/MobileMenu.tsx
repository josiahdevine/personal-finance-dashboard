import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Sun, Moon } from 'lucide-react';
import { Button } from '../ui/button';
import { 
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle
} from '../ui/sheet';
import { useTheme } from '../../contexts/ThemeContext';
import { Separator } from '../ui/separator';

export const MobileMenu: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  const handleThemeToggle = () => {
    toggleTheme();
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          aria-label="Open menu"
          tabIndex={0}
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[350px]">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-left">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-primary">FinanceDash</span>
            </Link>
          </SheetTitle>
        </SheetHeader>
        
        <nav className="flex flex-col space-y-6">
          {/* Main Navigation Links */}
          <div className="space-y-3">
            <Link 
              to="/" 
              className="flex items-center py-2 text-lg font-medium text-gray-900 dark:text-gray-100 hover:text-primary dark:hover:text-primary-light"
              aria-label="Home"
              tabIndex={0}
            >
              Home
            </Link>
            <Link 
              to="/features" 
              className="flex items-center py-2 text-lg font-medium text-gray-900 dark:text-gray-100 hover:text-primary dark:hover:text-primary-light"
              aria-label="Features"
              tabIndex={0}
            >
              Features
            </Link>
            <Link 
              to="/pricing" 
              className="flex items-center py-2 text-lg font-medium text-gray-900 dark:text-gray-100 hover:text-primary dark:hover:text-primary-light"
              aria-label="Pricing"
              tabIndex={0}
            >
              Pricing
            </Link>
            <Link 
              to="/demo" 
              className="flex items-center py-2 text-lg font-medium text-gray-900 dark:text-gray-100 hover:text-primary dark:hover:text-primary-light"
              aria-label="Demo"
              tabIndex={0}
            >
              Demo
            </Link>
          </div>
          
          <Separator />
          
          {/* Theme Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {isDarkMode ? 'Dark Mode' : 'Light Mode'}
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleThemeToggle}
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              tabIndex={0}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
          
          <Separator />
          
          {/* Auth Buttons */}
          <div className="space-y-3 pt-2">
            <Button 
              variant="outline" 
              className="w-full justify-center font-medium"
              asChild
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
              className="w-full justify-center font-medium bg-primary hover:bg-primary/90"
              asChild
            >
              <Link 
                to="/register"
                aria-label="Get started with FinanceDash"
                tabIndex={0}
              >
                Get Started
              </Link>
            </Button>
            <Button 
              variant="link" 
              className="w-full justify-center text-primary dark:text-primary-light"
              asChild
            >
              <Link 
                to="/learn-more"
                aria-label="Learn more about FinanceDash"
                tabIndex={0}
              >
                Learn More
              </Link>
            </Button>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}; 