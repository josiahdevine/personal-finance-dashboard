import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { CashFlowDashboard } from '../components/features/cashFlow/CashFlowDashboard';
import { Card } from '../components/common/Card';
import { TimePeriod } from '../components/features/cashFlow/CashFlowDashboard';

const CashFlowPredictionPage: React.FC = () => {
  const { isDarkMode: _isDarkMode } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('3m');
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>(['all']); // 'all' is a special value to include all accounts
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // In a real app, these would be fetched from an API
  const accounts = [
    { id: 'acct_1', name: 'Checking Account', balance: 5200 },
    { id: 'acct_2', name: 'Savings Account', balance: 12300 },
    { id: 'acct_3', name: 'Credit Card', balance: -2100 }
  ];
  
  const handlePeriodChange = (period: TimePeriod) => {
    setIsLoading(true);
    setSelectedPeriod(period);
    
    // Simulate API call delay
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };
  
  const handleAccountChange = (accountIds: string[]) => {
    setIsLoading(true);
    setSelectedAccounts(accountIds);
    
    // Simulate API call delay
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Cash Flow Prediction</h1>
          <p className="text-gray-600 dark:text-gray-400">
            View your historical cash flow and see predictions for upcoming months
          </p>
        </div>
        
        {/* Account selection */}
        <Card className="p-4">
          <h2 className="text-lg font-medium mb-4">Account Selection</h2>
          <div className="flex flex-wrap gap-2">
            <button
              className={`px-4 py-2 rounded-lg text-sm ${
                selectedAccounts.includes('all')
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
              }`}
              onClick={() => handleAccountChange(['all'])}
            >
              All Accounts
            </button>
            
            {accounts.map((account) => (
              <button
                key={account.id}
                className={`px-4 py-2 rounded-lg text-sm ${
                  selectedAccounts.includes(account.id) && !selectedAccounts.includes('all')
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                }`}
                onClick={() => {
                  // Toggle selection for this account
                  if (selectedAccounts.includes('all')) {
                    // If "All" is currently selected, switch to just this account
                    handleAccountChange([account.id]);
                  } else if (selectedAccounts.includes(account.id)) {
                    // If this account is selected, deselect it
                    const updatedAccounts = selectedAccounts.filter(id => id !== account.id);
                    handleAccountChange(updatedAccounts.length > 0 ? updatedAccounts : ['all']);
                  } else {
                    // Add this account to selection
                    handleAccountChange([...selectedAccounts, account.id]);
                  }
                }}
              >
                {account.name}
              </button>
            ))}
          </div>
        </Card>
        
        {/* Main Dashboard */}
        <CashFlowDashboard
          accountIds={selectedAccounts.includes('all') ? accounts.map(a => a.id) : selectedAccounts}
          period={selectedPeriod}
          isLoading={isLoading}
          onPeriodChange={handlePeriodChange}
          includeProjections={true}
        />
      </div>
    </div>
  );
};

export default CashFlowPredictionPage; 
