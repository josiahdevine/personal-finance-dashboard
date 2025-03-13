import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cva, type VariantProps } from "class-variance-authority";
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from "../ui/button";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '../ui/dropdown-menu';
import { cn } from '../../lib/utils';
import type { User } from '../../types/models';
import { BaseComponentProps } from '../../types/components';

// Icons
import {
  Sun,
  Moon,
  LogOut,
  User as UserIcon,
  Menu,
  Search,
  Settings,
  LayoutDashboard,
  CreditCard,
  PieChart
} from 'lucide-react';

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

export interface NavbarProps extends BaseComponentProps, VariantProps<typeof navbarVariants> {
  logo?: React.ReactNode;
  showThemeToggle?: boolean;
  showSearchCommand?: boolean;
  onMenuClick?: () => void;
  actions?: React.ReactNode;
  user?: User;
}

/**
 * @deprecated This component is deprecated and will be removed in a future version.
 * Please use the Header component from 'src/components/navigation/Header.tsx' instead.
 */
export const Navbar = React.forwardRef<HTMLElement, NavbarProps>(({
  className,
  variant,
  width,
  logo,
  showThemeToggle = true,
  showSearchCommand = true,
  onMenuClick,
  actions,
  user,
  ...props
}, ref) => {
  const navigate = useNavigate();
  const { isAuthenticated, signOut } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
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

  const handleCommandSelect = (value: string) => {
    setShowCommandMenu(false);
    navigate(value);
  };

  // Navigation items based on authentication status
  const getNavigationItems = () => {
    // Common navigation items for all users
    const commonItems = [
      { label: 'Home', value: '/', icon: <LayoutDashboard className="h-4 w-4" /> },
      { label: 'Features', value: '/features', icon: <PieChart className="h-4 w-4" /> },
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

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

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
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/dashboard')}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
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
            <form className="grid gap-4">
              <div className="grid gap-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
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
    <header 
      ref={ref}
      className={cn(
        navbarVariants({ variant: isScrolled ? "elevated" : variant, width }),
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-4">
        {onMenuClick && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="md:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        {logo || defaultLogo}
      </div>

      {showSearchCommand && (
        <div className="flex flex-1 items-center justify-center px-4">
          <Popover open={showCommandMenu} onOpenChange={setShowCommandMenu}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={showCommandMenu}
                className="w-full max-w-sm justify-between"
              >
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  <span className="hidden sm:inline-block">Search...</span>
                </div>
                <kbd className="hidden sm:inline-block pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full max-w-sm p-0" align="start">
              <Command>
                <CommandInput placeholder="Type a command or search..." value={searchQuery} onValueChange={setSearchQuery} />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup>
                    {filteredItems.map((item) => (
                      <CommandItem
                        key={item.value}
                        value={item.value}
                        onSelect={handleCommandSelect}
                      >
                        {item.icon}
                        <span className="ml-2">{item.label}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      )}

      <div className="flex items-center gap-4">
        {actions}
        
        {showThemeToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="hidden md:flex"
            aria-label="Toggle theme"
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        )}

        {renderAuthSection()}
      </div>
    </header>
  );
});

Navbar.displayName = "Navbar"; 