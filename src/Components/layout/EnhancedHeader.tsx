import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  SunIcon, 
  MoonIcon, 
  ArrowRightOnRectangleIcon,
  IdentificationIcon,
  PresentationChartLineIcon
} from '@heroicons/react/24/outline';
import {
  Search as SearchIcon,
  User as UserIcon
} from 'lucide-react';
import type { ThemeMode } from '../../types/theme';
import { Button } from '../ui/button';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator } from '../ui/command';
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

export interface EnhancedHeaderProps {
  theme: ThemeMode;
  onThemeToggle: () => void;
  className?: string;
}

export const EnhancedHeader: React.FC<EnhancedHeaderProps> = ({ 
  theme, 
  onThemeToggle,
  className = '' 
}) => {
  const navigate = useNavigate();
  const { isAuthenticated, user, signInWithEmail, signInWithGoogle, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showCommandMenu, setShowCommandMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
      { label: 'Home', value: '/' },
      { label: 'Features', value: '/features' },
      { label: 'Pricing', value: '/pricing' },
      { label: 'Demo', value: '/demo' },
    ];

    // Items only for authenticated users
    const authenticatedItems = [
      { label: 'Dashboard', value: '/dashboard' },
      { label: 'Accounts', value: '/accounts' },
      { label: 'Transactions', value: '/transactions' },
      { label: 'Budgets', value: '/budgets' },
      { label: 'Reports', value: '/reports' },
      { label: 'Settings', value: '/settings' },
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

  return (
    <header className={`sticky top-0 z-50 w-full border-b border-border bg-background ${className}`}>
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="text-2xl font-bold"
          >
            FinanceDash
          </button>
        </div>

        {/* Command search bar - moved to center */}
        <div className="hidden md:flex flex-1 justify-center items-center mx-4">
          <Button 
            variant="outline" 
            className="relative w-full max-w-sm justify-start gap-2 pl-3"
            onClick={() => setShowCommandMenu(true)}
          >
            <SearchIcon className="h-4 w-4" />
            <span className="text-muted-foreground">Search...</span>
            <kbd className="pointer-events-none absolute right-2 top-2 inline-flex h-5 select-none items-center gap-1 rounded border px-1.5 font-mono text-xs font-medium opacity-100">
              <span>⌘</span>K
            </kbd>
          </Button>
        </div>

        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onThemeToggle}
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </Button>

          {/* Login or user dropdown depending on authentication status */}
          <div className="ml-4">
            {renderAuthSection()}
          </div>
        </div>
      </div>

      {/* Command Menu */}
      {showCommandMenu && (
        <div 
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          onClick={() => setShowCommandMenu(false)}
        >
          <div 
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Command className="rounded-lg border shadow-md">
              <CommandInput 
                placeholder="Search navigation..." 
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Navigation">
                  {filteredItems.map((item) => (
                    <CommandItem
                      key={item.value}
                      onSelect={() => handleCommandSelect(item.value)}
                    >
                      {item.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
                
                {isAuthenticated && (
                  <>
                    <CommandSeparator />
                    <CommandGroup heading="Quick Actions">
                      <CommandItem onSelect={() => { handleLogout(); setShowCommandMenu(false); }}>
                        Sign Out
                      </CommandItem>
                      <CommandItem onSelect={() => { navigate('/settings'); setShowCommandMenu(false); }}>
                        Account Settings
                      </CommandItem>
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
          </div>
        </div>
      )}
    </header>
  );
};
