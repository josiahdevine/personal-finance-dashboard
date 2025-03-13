import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { cva, type VariantProps } from "class-variance-authority";
import { 
  SunIcon, 
  MoonIcon, 
  ArrowRightOnRectangleIcon,
  IdentificationIcon,
  PresentationChartLineIcon
} from '@heroicons/react/24/outline';
import {
  Search as SearchIcon,
  User as UserIcon,
  Menu as MenuIcon,
  LayoutDashboard,
  CreditCard,
  Settings
} from 'lucide-react';
import type { ThemeMode } from '../../types/theme';
import { Button } from '../ui/button';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '../ui/command';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '../ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Separator } from '../ui/separator';
import { cn } from '../../lib/utils';
import { BaseComponentProps } from '../../types/components';

// Define navbar variants
const navbarVariants = cva(
  "sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60",
  {
    variants: {
      variant: {
        default: "",
        elevated: "shadow-sm",
        transparent: "bg-transparent backdrop-blur-none border-transparent supports-[backdrop-filter]:bg-transparent",
      },
      width: {
        default: "w-full",
        constrained: "max-w-screen-xl mx-auto",
      },
    },
    defaultVariants: {
      variant: "default",
      width: "default",
    },
  }
);

export interface EnhancedHeaderProps extends BaseComponentProps, VariantProps<typeof navbarVariants> {
  theme?: ThemeMode;
  onThemeToggle?: () => void;
  onMenuClick?: () => void;
  isSidebarCollapsed?: boolean;
  logo?: React.ReactNode;
  showThemeToggle?: boolean;
  showSearchCommand?: boolean;
  actions?: React.ReactNode;
}

export const EnhancedHeader: React.FC<EnhancedHeaderProps> = ({ 
  theme = 'light', 
  onThemeToggle,
  className,
  onMenuClick,
  variant,
  width,
  logo,
  showThemeToggle = true,
  showSearchCommand = true,
  actions
}) => {
  const navigate = useNavigate();
  const { isAuthenticated, user, signInWithEmail, signInWithGoogle, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showCommandMenu, setShowCommandMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  // Track scrolling for elevated effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle keyboard shortcut for command menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandMenu(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmail(email, password);
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleCommandSelect = (value: string) => {
    setShowCommandMenu(false);
    navigate(value);
  };

  // Navigation items based on authentication status
  const getNavigationItems = () => {
    // Common navigation items for all users
    const commonItems = [
      { label: 'Home', value: '/', icon: <LayoutDashboard className="h-4 w-4" /> },
      { label: 'Features', value: '/features', icon: <CreditCard className="h-4 w-4" /> },
      { label: 'Pricing', value: '/pricing', icon: <CreditCard className="h-4 w-4" /> },
    ];

    // Items only for authenticated users
    const authenticatedItems = [
      { label: 'Dashboard', value: '/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
      { label: 'Accounts', value: '/accounts', icon: <CreditCard className="h-4 w-4" /> },
      { label: 'Transactions', value: '/transactions', icon: <CreditCard className="h-4 w-4" /> },
      { label: 'Settings', value: '/settings', icon: <Settings className="h-4 w-4" /> },
    ];

    return isAuthenticated 
      ? [...commonItems, ...authenticatedItems]
      : commonItems;
  };

  const navigationItems = getNavigationItems();
  const filteredItems = navigationItems.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isDark = theme === 'dark';

  // Function to render login/user section based on authentication status
  const renderAuthSection = () => {
    if (isAuthenticated && user) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                <span className="text-sm font-medium text-primary-foreground">
                  {user.name ? user.name[0].toUpperCase() : user.email?.[0].toUpperCase() || 'U'}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user.name || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <IdentificationIcon className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/dashboard')}>
              <PresentationChartLineIcon className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <ArrowRightOnRectangleIcon className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <UserIcon className="h-4 w-4" />
            <span>Login</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <div className="grid gap-4 p-6">
            <div className="flex flex-col space-y-2 text-center">
              <h3 className="font-semibold tracking-tight">Login to your account</h3>
              <p className="text-sm text-muted-foreground">
                Enter your credentials below to login to your account
              </p>
            </div>
            <form onSubmit={handleLogin} className="grid gap-4">
              <div className="grid gap-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleGoogleLogin}
              className="w-full"
            >
              <svg
                className="mr-2 h-4 w-4"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20.283 10.356h-8.327v3.451h4.792c-.446 2.193-2.313 3.453-4.792 3.453a5.27 5.27 0 0 1-5.279-5.28 5.27 5.27 0 0 1 5.279-5.279c1.259 0 2.397.447 3.29 1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233a8.908 8.908 0 0 0-8.934 8.934 8.907 8.907 0 0 0 8.934 8.934c4.467 0 8.529-3.249 8.529-8.934 0-.528-.081-1.097-.202-1.625z"
                  fill="currentColor"
                />
              </svg>
              Google
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  // Default logo if none is provided
  const defaultLogo = (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="32" height="32" rx="8" fill="hsl(var(--primary))" />
          <path d="M22 12H10C9.44772 12 9 12.4477 9 13V19C9 19.5523 9.44772 20 10 20H22C22.5523 20 23 19.5523 23 19V13C23 12.4477 22.5523 12 22 12Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16 17C16.5523 17 17 16.5523 17 16C17 15.4477 16.5523 15 16 15C15.4477 15 15 15.4477 15 16C15 16.5523 15.4477 17 16 17Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M20 12V10C20 9.46957 19.7893 8.96086 19.4142 8.58579C19.0391 8.21071 18.5304 8 18 8H14C13.4696 8 12.9609 8.21071 12.5858 8.58579C12.2107 8.96086 12 9.46957 12 10V12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 20V22C12 22.5304 12.2107 23.0391 12.5858 23.4142C12.9609 23.7893 13.4696 24 14 24H18C18.5304 24 19.0391 23.7893 19.4142 23.4142C19.7893 23.0391 20 22.5304 20 22V20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span className="hidden md:inline-block text-lg font-bold">FinanceDash</span>
    </div>
  );

  return (
    <header className={cn(
      navbarVariants({ variant: isScrolled ? 'elevated' : variant, width }),
      className
    )}>
      <div className="flex items-center gap-4">
        {onMenuClick && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="md:hidden"
            aria-label="Toggle menu"
          >
            <MenuIcon className="h-5 w-5" />
          </Button>
        )}
        
        {/* Logo section */}
        <div className="flex items-center gap-2">
          {logo || defaultLogo}
        </div>
      </div>

      {/* Center section with navigation if needed */}
      <div className="hidden md:flex items-center space-x-4">
        {navigationItems.slice(0, 3).map((item) => (
          <Button
            key={item.value}
            variant="ghost"
            className="text-sm font-medium"
            onClick={() => navigate(item.value)}
          >
            {item.label}
          </Button>
        ))}
      </div>

      {/* Right section with search, theme toggle, and auth */}
      <div className="ml-auto flex items-center gap-2">
        {showSearchCommand && (
          <Popover open={showCommandMenu} onOpenChange={setShowCommandMenu}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex gap-2 w-[200px] justify-between"
              >
                <div className="flex items-center gap-2 text-muted-foreground">
                  <SearchIcon className="h-4 w-4" />
                  <span className="text-sm">Search...</span>
                </div>
                <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100 sm:flex">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[300px]" align="end">
              <Command>
                <CommandInput 
                  placeholder="Search navigation..."
                  onValueChange={setSearchQuery}
                />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup heading="Navigation">
                    {filteredItems.map((item) => (
                      <CommandItem
                        key={item.value}
                        onSelect={() => handleCommandSelect(item.value)}
                        className="flex items-center gap-2"
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}
        
        {/* Mobile search button */}
        {showSearchCommand && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowCommandMenu(true)}
            className="md:hidden"
            aria-label="Search"
          >
            <SearchIcon className="h-5 w-5" />
          </Button>
        )}

        {/* Theme toggle button */}
        {showThemeToggle && onThemeToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onThemeToggle}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </Button>
        )}

        {/* Custom actions if provided */}
        {actions}

        {/* Authentication section */}
        {renderAuthSection()}
      </div>
    </header>
  );
};
