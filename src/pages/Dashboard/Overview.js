import React from 'react';
import { Card } from '../../components/ui';
import { useNavigate } from 'react-router-dom';

/**
 * Overview page for the dashboard
 * 
 * @component
 */
const Overview = () => {
  const navigate = useNavigate();

  // Sample data for the overview page
  const accountData = {
    totalBalance: 42850.76,
    totalIncome: 5500.00,
    totalExpenses: 2350.45,
    savingsRate: 57,
    recentTransactions: [
      { id: 1, name: 'Grocery Store', amount: -125.30, date: '2023-10-15', category: 'Groceries' },
      { id: 2, name: 'Salary Deposit', amount: 2750.00, date: '2023-10-15', category: 'Income' },
      { id: 3, name: 'Netflix Subscription', amount: -14.99, date: '2023-10-14', category: 'Entertainment' },
      { id: 4, name: 'Starbucks', amount: -5.75, date: '2023-10-13', category: 'Dining' },
      { id: 5, name: 'Gas Station', amount: -45.20, date: '2023-10-12', category: 'Transportation' },
    ],
    accounts: [
      { id: 1, name: 'Chase Checking', balance: 4250.45, type: 'checking' },
      { id: 2, name: 'Chase Savings', balance: 12500.31, type: 'savings' },
      { id: 3, name: 'Vanguard Retirement', balance: 26100.00, type: 'investment' },
    ],
    budgets: [
      { id: 1, name: 'Groceries', spent: 350, budget: 500, percentage: 70 },
      { id: 2, name: 'Dining Out', spent: 220, budget: 300, percentage: 73 },
      { id: 3, name: 'Entertainment', spent: 90, budget: 150, percentage: 60 },
      { id: 4, name: 'Transportation', spent: 180, budget: 200, percentage: 90 },
    ],
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>
      
      {/* Main metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Balance</h3>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(accountData.totalBalance)}
          </p>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-green-600 font-medium flex items-center">
              <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586l3.293-3.293A1 1 0 0112 7z" clipRule="evenodd" />
              </svg>
              5.3%
            </span>
            <span className="text-gray-500 ml-1">from last month</span>
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Monthly Income</h3>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(accountData.totalIncome)}
          </p>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-green-600 font-medium flex items-center">
              <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586l3.293-3.293A1 1 0 0112 7z" clipRule="evenodd" />
              </svg>
              2.1%
            </span>
            <span className="text-gray-500 ml-1">from last month</span>
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Monthly Expenses</h3>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(accountData.totalExpenses)}
          </p>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-red-600 font-medium flex items-center">
              <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v3.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586l-4.293-4.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414l3.293 3.293A1 1 0 0012 13z" clipRule="evenodd" />
              </svg>
              3.5%
            </span>
            <span className="text-gray-500 ml-1">from last month</span>
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Savings Rate</h3>
          <p className="text-2xl font-bold text-gray-900">
            {accountData.savingsRate}%
          </p>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-green-600 font-medium flex items-center">
              <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586l3.293-3.293A1 1 0 0112 7z" clipRule="evenodd" />
              </svg>
              4.2%
            </span>
            <span className="text-gray-500 ml-1">from last month</span>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Accounts summary */}
        <Card className="col-span-1 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Accounts</h2>
          <div className="space-y-3">
            {accountData.accounts && Array.isArray(accountData.accounts) && accountData.accounts.length > 0 ? (
              accountData.accounts.map((account) => (
                <div key={account.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      account.type === 'checking' ? 'bg-blue-100 text-blue-600' :
                      account.type === 'savings' ? 'bg-green-100 text-green-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      {account.type === 'checking' && (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                          <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                        </svg>
                      )}
                      {account.type === 'savings' && (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                        </svg>
                      )}
                      {account.type === 'investment' && (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                      )}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{account.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{account.type}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(account.balance)}
                  </span>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-white rounded-lg shadow p-6 text-center">
                <p className="text-gray-500">No accounts connected yet.</p>
                <button 
                  onClick={() => navigate('/accounts')}
                  className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Connect Accounts
                </button>
              </div>
            )}
          </div>
          <button
            className="mt-4 w-full py-2 px-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            View All Accounts
          </button>
        </Card>
        
        {/* Recent transactions */}
        <Card className="col-span-1 lg:col-span-2 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h2>
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {accountData.recentTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{transaction.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{transaction.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatDate(transaction.date)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className={`text-sm font-medium ${
                        transaction.amount < 0 
                          ? 'text-red-600' 
                          : 'text-green-600'
                      }`}>
                        {formatCurrency(transaction.amount)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            className="mt-4 w-full py-2 px-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            View All Transactions
          </button>
        </Card>
      </div>
      
      {/* Budget progress */}
      <div className="mt-8">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Budget Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {accountData.budgets.map((budget) => (
              <div key={budget.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-700">{budget.name}</h3>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(budget.spent)} / {formatCurrency(budget.budget)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${
                      budget.percentage >= 90 ? 'bg-red-600' :
                      budget.percentage >= 75 ? 'bg-yellow-500' :
                      'bg-green-600'
                    }`}
                    style={{ width: `${budget.percentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 text-right">
                  {budget.percentage}% used
                </p>
              </div>
            ))}
          </div>
          <button
            className="mt-6 w-full py-2 px-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            View All Budgets
          </button>
        </Card>
      </div>
    </div>
  );
};

export default Overview; 