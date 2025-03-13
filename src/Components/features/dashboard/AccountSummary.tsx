import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/skeleton";
import { ResponsiveContainer, ResponsiveGrid } from '../../../components/layout/ResponsiveContainer';
import { useTheme } from '../../../contexts/ThemeContext';
import { formatCurrency } from '../../../utils/formatters';
import { cn } from '../../../lib/utils';
import { 
  PlusCircleIcon, 
  BanknotesIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

export interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  institution?: string;
  institutionLogo?: string;
  lastUpdated?: Date;
}

export interface AccountSummaryProps {
  accounts: Account[];
  totalBalance: number;
  isLoading?: boolean;
  onAccountClick?: (id: string) => void;
  showAddAccount?: boolean;
  onAddAccount?: () => void;
  className?: string;
}

// Account type colors and icons for visual distinction
const accountTypeConfig: Record<string, { color: string; darkColor: string; icon: React.ReactNode }> = {
  checking: { 
    color: 'bg-blue-100 text-blue-800', 
    darkColor: 'bg-blue-900 text-blue-100',
    icon: <BanknotesIcon className="h-5 w-5" />
  },
  savings: { 
    color: 'bg-green-100 text-green-800', 
    darkColor: 'bg-green-900 text-green-100',
    icon: <ArrowTrendingUpIcon className="h-5 w-5" />
  },
  investment: { 
    color: 'bg-purple-100 text-purple-800', 
    darkColor: 'bg-purple-900 text-purple-100',
    icon: <ArrowTrendingUpIcon className="h-5 w-5" />
  },
  credit: { 
    color: 'bg-orange-100 text-orange-800', 
    darkColor: 'bg-orange-900 text-orange-100',
    icon: <BanknotesIcon className="h-5 w-5" />
  },
  loan: { 
    color: 'bg-red-100 text-red-800', 
    darkColor: 'bg-red-900 text-red-100',
    icon: <BanknotesIcon className="h-5 w-5" />
  },
  // Default for any other type
  default: { 
    color: 'bg-gray-100 text-gray-800', 
    darkColor: 'bg-gray-800 text-gray-100',
    icon: <BanknotesIcon className="h-5 w-5" />
  }
};

export const AccountSummary: React.FC<AccountSummaryProps> = ({
  accounts,
  totalBalance,
  isLoading = false,
  onAccountClick,
  showAddAccount = true,
  onAddAccount,
  className = ''
}) => {
  const { isDarkMode } = useTheme();
  
  // Handle account click with animation
  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleAccountClick(id);
    }
  };
  
  // Handle account click with animation
  const handleAccountClick = (id: string) => {
    if (onAccountClick) {
      onAccountClick(id);
    }
  };

  // Loading state with skeleton UI
  if (isLoading) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader>
          <div className="flex justify-between items-center w-full">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-8 w-1/4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <Skeleton className="h-14 w-full" />
            <div className="flex space-x-4 overflow-x-auto pb-2">
              <Skeleton className="h-20 w-48 flex-shrink-0" />
              <Skeleton className="h-20 w-48 flex-shrink-0" />
              <Skeleton className="h-20 w-48 flex-shrink-0" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <ResponsiveContainer className={cn("p-0", className)}>
      <Card variant="dashboard" className="w-full h-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xl font-bold">Accounts Summary</CardTitle>
          <span className="text-2xl font-bold">
            {formatCurrency(totalBalance)}
          </span>
        </CardHeader>
        
        <CardContent>
          {accounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-muted-foreground mb-4">No accounts connected yet</p>
              {showAddAccount && onAddAccount && (
                <Button 
                  onClick={onAddAccount} 
                  className="flex items-center"
                >
                  <PlusCircleIcon className="h-5 w-5 mr-2" />
                  Connect Account
                </Button>
              )}
            </div>
          ) : (
            <>
              <ResponsiveGrid
                columns={{ base: 1, md: 2 }}
                gap="4"
                className="mb-4"
              >
                <AnimatePresence>
                  {accounts.map((account) => {
                    const config = accountTypeConfig[account.type.toLowerCase()] || accountTypeConfig.default;
                    const colorClass = isDarkMode ? config.darkColor : config.color;
                    
                    return (
                      <motion.div
                        key={account.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="w-full"
                      >
                        <div
                          className={cn(
                            "flex items-center rounded-lg p-4 border", 
                            onAccountClick && "cursor-pointer hover:shadow-md transition-shadow"
                          )}
                          onClick={() => onAccountClick && handleAccountClick(account.id)}
                          onKeyDown={(e) => onAccountClick && handleKeyDown(e, account.id)}
                          tabIndex={onAccountClick ? 0 : undefined}
                          role={onAccountClick ? "button" : undefined}
                          aria-label={onAccountClick ? `View details for ${account.name}` : undefined}
                        >
                          <div className={cn(
                            "flex items-center justify-center p-3 rounded-full mr-4", 
                            colorClass
                          )}>
                            {config.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-medium truncate">{account.name}</h3>
                            <p className="text-xs text-muted-foreground">
                              {account.institution || account.type}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-base font-semibold">
                              {formatCurrency(account.balance)}
                            </p>
                            {account.lastUpdated && (
                              <p className="text-xs text-muted-foreground">
                                Updated {new Date(account.lastUpdated).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </ResponsiveGrid>
              
              {showAddAccount && onAddAccount && (
                <CardFooter className="justify-center pt-2">
                  <Button 
                    variant="outline" 
                    onClick={onAddAccount} 
                    className="flex items-center w-full sm:w-auto"
                  >
                    <PlusCircleIcon className="h-5 w-5 mr-2" />
                    Connect Another Account
                  </Button>
                </CardFooter>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </ResponsiveContainer>
  );
}; 