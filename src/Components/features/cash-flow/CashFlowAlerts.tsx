import React from 'react';
import { Skeleton } from '../../../components/common/Skeleton';

interface UpcomingBill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  category: string;
  isPaid: boolean;
  isRecurring: boolean;
}

interface CashFlowAlertsProps {
  upcomingBills: UpcomingBill[];
  isLoading?: boolean;
  className?: string;
}

export const CashFlowAlerts: React.FC<CashFlowAlertsProps> = ({
  upcomingBills,
  isLoading = false,
  className = '',
}) => {
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };
  
  // Calculate days until due date
  const getDaysUntil = (dateString: string) => {
    const dueDate = new Date(dateString);
    const today = new Date();
    
    // Reset time to midnight for accurate day calculation
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };
  
  // Get appropriate styling based on due date proximity
  const getUrgencyStyles = (daysUntil: number) => {
    if (daysUntil < 0) {
      return 'text-red-600 dark:text-red-400 font-medium';
    } else if (daysUntil <= 3) {
      return 'text-red-500 dark:text-red-400 font-medium';
    } else if (daysUntil <= 7) {
      return 'text-yellow-500 dark:text-yellow-400';
    } else {
      return 'text-green-600 dark:text-green-400';
    }
  };
  
  // Sort bills by due date (ascending)
  const sortedBills = [...upcomingBills].sort((a, b) => {
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
  
  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex justify-between p-3 border rounded-lg">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <div className="text-right space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (sortedBills.length === 0) {
    return (
      <div className={`text-center py-6 text-gray-500 dark:text-gray-400 ${className}`}>
        No upcoming bills to display
      </div>
    );
  }
  
  return (
    <div className={`space-y-4 ${className}`}>
      {sortedBills.map((bill) => {
        const daysUntil = getDaysUntil(bill.dueDate);
        const urgencyClass = getUrgencyStyles(daysUntil);
        const dueDate = new Date(bill.dueDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
        
        return (
          <div 
            key={bill.id}
            className="flex justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div>
              <div className="font-medium">{bill.name}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                <span className="capitalize">{bill.category}</span>
                {bill.isRecurring && (
                  <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                    Recurring
                  </span>
                )}
              </div>
            </div>
            
            <div className="text-right">
              <div className="font-medium">{formatCurrency(bill.amount)}</div>
              <div className={`text-sm mt-1 ${urgencyClass}`}>
                {daysUntil < 0
                  ? `Overdue by ${Math.abs(daysUntil)} day${Math.abs(daysUntil) !== 1 ? 's' : ''}`
                  : daysUntil === 0
                  ? 'Due today'
                  : `Due in ${daysUntil} day${daysUntil !== 1 ? 's' : ''} (${dueDate})`}
              </div>
            </div>
          </div>
        );
      })}
      
      {/* View all link if needed */}
      {upcomingBills.length > 5 && (
        <div className="text-center pt-2">
          <button className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">
            View all bills
          </button>
        </div>
      )}
    </div>
  );
}; 