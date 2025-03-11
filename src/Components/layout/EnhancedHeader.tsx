import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { SunIcon, MoonIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { ThemeMode } from '../../types/theme';
import { Button } from '../ui/button';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '../ui/hover-card';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '../ui/command';

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
  const { isAuthenticated, signInWithEmail, signOut } = useAuth();
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

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleCommandSelect = (value: string) => {
    setShowCommandMenu(false);
    navigate(value);
  };

  // Navigation items that can be accessed via command menu
  const navigationItems = [
    { label: 'Dashboard', value: '/dashboard' },
    { label: 'Accounts', value: '/accounts' },
    { label: 'Transactions', value: '/transactions' },
    { label: 'Budgets', value: '/budgets' },
    { label: 'Reports', value: '/reports' },
    { label: 'Settings', value: '/settings' },
  ];

  const filteredItems = navigationItems.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isDark = theme === 'dark';

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

          <div className="hidden md:block ml-4">
            <Button 
              variant="ghost" 
              className="gap-2"
              onClick={() => setShowCommandMenu(true)}
            >
              <MagnifyingGlassIcon className="h-4 w-4" />
              <span>Search...</span>
              <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border px-1.5 font-mono text-xs font-medium opacity-100">
                <span>⌘</span>K
              </kbd>
            </Button>
          </div>
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

          {/* User Menu */}
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
              >
                Dashboard
              </Button>
              <Button
                variant="ghost"
                onClick={handleLogout}
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button variant="outline">Sign In</Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <h4 className="font-medium leading-none mb-2">Sign In</h4>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium">
                        Password
                      </label>
                      <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Sign In
                    </Button>
                  </form>
                </HoverCardContent>
              </HoverCard>
              
              <Button
                onClick={() => navigate('/register')}
                className="bg-primary text-primary-foreground"
              >
                Get Started
              </Button>
            </div>
          )}
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
              </CommandList>
            </Command>
          </div>
        </div>
      )}
    </header>
  );
};
