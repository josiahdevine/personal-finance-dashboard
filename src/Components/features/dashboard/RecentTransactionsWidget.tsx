import React from 'react';
import Card from "../../../components/common/card_component/Card";
import Button from "../../../components/common/button/Button";
import { 
  ArrowUpIcon, 
  ArrowDownIcon,
  ChevronRightIcon 
} from '@heroicons/react/24/outline';

export interface Transaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  accountName?: string;
  merchant?: {
    name: string;
    logo?: string;
  };
}

export interface RecentTransactionsWidgetProps {
  transactions: Transaction[];
  isLoading?: boolean;
  onViewAll?: () => void;
  maxItems?: number;
  className?: string;
}

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));
};

// Helper function to format date
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date);
};

// Format relative time (today, yesterday, etc)
const getRelativeDate = (date: Date): string => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const txnDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  if (txnDate.getTime() === today.getTime()) {
    return 'Today';
  } else if (txnDate.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  } else {
    return formatDate(date);
  }
};

export const RecentTransactionsWidget: React.FC<RecentTransactionsWidgetProps> = ({
  transactions = [],
  isLoading = false,
  onViewAll,
  maxItems = 5,
  className = '',
}) => {
  const displayTransactions = transactions.slice(0, maxItems);
  
  // Loading state
  if (isLoading) {
    return (
      <Card className={`overflow-hidden ${className}`}>
        <Card.Header>
          <div className="animate-pulse h-7 bg-gray-200 dark:bg-gray-700 rounded w-2/5"></div>
        </Card.Header>
        <Card.Body>
          <div className="animate-pulse space-y-4">
            {[...Array(maxItems)].map((_, i) => (
              <div key={i} className="flex justify-between items-center py-3">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>
    );
  }
  
  // Group transactions by date
  const groupedTransactions: { [key: string]: Transaction[] } = {};
  
  displayTransactions.forEach(transaction => {
    const dateKey = getRelativeDate(transaction.date);
    if (!groupedTransactions[dateKey]) {
      groupedTransactions[dateKey] = [];
    }
    groupedTransactions[dateKey].push(transaction);
  });
  
  return (
    <Card className={`overflow-hidden ${className}`}>
      <Card.Header>
        <h2 className="text-xl font-semibold">Recent Transactions</h2>
      </Card.Header>
      <Card.Body className="p-0">
        {displayTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No recent transactions</p>
          </div>
        ) : (
          <div>
            {Object.entries(groupedTransactions).map(([dateGroup, txns]) => (
              <div key={dateGroup}>
                <div className="px-6 py-2 bg-gray-50 dark:bg-gray-800/50 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {dateGroup}
                </div>
                {txns.map((transaction) => (
                  <div 
                    key={transaction.id} 
                    className="px-6 py-3 flex items-center justify-between border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150"
                  >
                    <div className="flex items-center space-x-3">
                      {transaction.merchant?.logo ? (
                        <img 
                          src={transaction.merchant.logo} 
                          alt={transaction.merchant.name} 
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className={`
                          h-10 w-10 rounded-full flex items-center justify-center
                          ${transaction.type === 'income' 
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' 
                            : 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'}
                        `}>
                          {transaction.type === 'income' 
                            ? <ArrowDownIcon className="h-5 w-5" /> 
                            : <ArrowUpIcon className="h-5 w-5" />}
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {transaction.description}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {transaction.accountName || transaction.category}
                        </div>
                      </div>
                    </div>
                    <div className={`
                      font-medium
                      ${transaction.type === 'income' 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'}
                    `}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </Card.Body>
      {onViewAll && transactions.length > 0 && (
        <Card.Footer className="text-center">
          <Button
            variant="text"
            size="sm"
            onClick={onViewAll}
            rightIcon={<ChevronRightIcon className="h-4 w-4" />}
          >
            View All Transactions
          </Button>
        </Card.Footer>
      )}
    </Card>
  );
}; 