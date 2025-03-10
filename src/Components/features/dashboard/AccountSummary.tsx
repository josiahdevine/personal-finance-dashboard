import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../../components/common/Card';
import { StatCard } from '../../../components/common/StatCard';
import { ResponsiveContainer, ResponsiveFlex } from '../../../components/layout/ResponsiveContainer';
import { useTheme } from '../../../contexts/ThemeContext';
import { formatCurrency } from '../../../utils/formatters';
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
    color: 'bg-blue-100', 
    darkColor: 'bg-blue-900',
    icon: <BanknotesIcon className="h-5 w-5" />
  },
  savings: { 
    color: 'bg-green-100', 
    darkColor: 'bg-green-900',
    icon: <ArrowTrendingUpIcon className="h-5 w-5" />
  },
  investment: { 
    color: 'bg-purple-100', 
    darkColor: 'bg-purple-900',
    icon: <ArrowTrendingUpIcon className="h-5 w-5" />
  },
  credit: { 
    color: 'bg-orange-100', 
    darkColor: 'bg-orange-900',
    icon: <BanknotesIcon className="h-5 w-5" />
  },
  loan: { 
    color: 'bg-red-100', 
    darkColor: 'bg-red-900',
    icon: <BanknotesIcon className="h-5 w-5" />
  },
  // Default for any other type
  default: { 
    color: 'bg-gray-100', 
    darkColor: 'bg-gray-800',
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
  const handleAccountClick = (id: string) => {
    if (onAccountClick) {
      onAccountClick(id);
    }
  };

  // Loading state with skeleton UI
  if (isLoading) {
    return (
      <Card className={`overflow-hidden ${className}`}>
        <Card.Header>
          <div className="animate-pulse flex justify-between items-center w-full">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="animate-pulse flex flex-col space-y-4">
            <div className="h-14 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="flex space-x-4 overflow-x-auto pb-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex-shrink-0 h-28 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
              ))}
            </div>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      <Card.Header className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Accounts Summary</h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Total Balance: <span className="font-semibold text-base">{formatCurrency(totalBalance)}</span>
        </div>
      </Card.Header>
      <Card.Body>
        {/* Total Balance Stat Card */}
        <div className="mb-4">
          <StatCard
            title="Total Balance"
            value={totalBalance}
            formatter={formatCurrency}
            icon={<BanknotesIcon className="h-6 w-6" />}
            iconBackground="primary"
            size="lg"
          />
        </div>

        {/* Scrollable Account Cards */}
        <ResponsiveContainer>
          <h3 className="text-base font-medium mb-3 text-gray-700 dark:text-gray-300">
            Your Accounts
          </h3>
          
          <div className="flex space-x-4 overflow-x-auto pb-2">
            <AnimatePresence>
              {accounts.map((account) => {
                const accountType = account.type.toLowerCase();
                const config = accountTypeConfig[accountType] || accountTypeConfig.default;
                
                return (
                  <motion.div
                    key={account.id}
                    className={`
                      flex-shrink-0 p-4 rounded-lg shadow-sm border cursor-pointer
                      transition-all duration-200 hover:shadow-md
                      ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
                    `}
                    style={{ width: '250px' }}
                    onClick={() => handleAccountClick(account.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    layoutId={`account-card-${account.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-start mb-3">
                      <div className={`p-2 rounded-md mr-3 ${isDarkMode ? config.darkColor : config.color}`}>
                        {config.icon}
                      </div>
                      <div className="flex-1 truncate">
                        <h4 className="font-medium text-base truncate">{account.name}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 capitalize truncate">
                          {account.institution ? `${account.institution} · ` : ''}
                          {account.type}
                        </p>
                      </div>
                    </div>
                    <div className="font-semibold text-lg">{formatCurrency(account.balance)}</div>
                    {account.lastUpdated && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Updated {account.lastUpdated.toLocaleDateString()}
                      </div>
                    )}
                  </motion.div>
                );
              })}
              
              {/* Add Account Button */}
              {showAddAccount && (
                <motion.div
                  className={`
                    flex-shrink-0 p-4 rounded-lg border border-dashed cursor-pointer
                    flex flex-col items-center justify-center
                    ${isDarkMode 
                      ? 'border-gray-700 hover:border-gray-500' 
                      : 'border-gray-300 hover:border-gray-400'
                    }
                  `}
                  style={{ width: '250px', minHeight: '160px' }}
                  onClick={onAddAccount}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <PlusCircleIcon className="h-10 w-10 mb-2 text-gray-400" />
                  <span className="text-sm font-medium text-gray-500">Add Account</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ResponsiveContainer>
      </Card.Body>
    </Card>
  );
}; 