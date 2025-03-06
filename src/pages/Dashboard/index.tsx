import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import BillsAnalysis from '../../components/Bills';
import SalaryJournal from '../../components/SalaryJournal';
import TransactionsAnalysis from '../../components/transactions';
import GoalsTracker from '../../components/goals';
import FinancialAnalytics from '../../components/Analytics';
import SubscriptionManager from '../../components/Subscriptions';
import InvestmentPortfolio from '../../components/Investments';
import PlaidIntegration from '../../components/plaid';
import AskAI from '../../components/AskAI';
import Navigation from '../../components/ui/Navigation';

type DashboardTab = 'overview' | 'bills' | 'salary' | 'transactions' | 'goals' | 'analytics' | 'subscriptions' | 'investments' | 'plaid' | 'ask-ai';

const Dashboard: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Mock data - in a real app, this would come from your API
  const mockData = {
    accountBalance: 25430.55,
    monthlyIncome: 5000,
    monthlyExpenses: 3200,
    recentTransactions: [
      { id: 1, description: 'Grocery Store', amount: -120.50, date: '2024-03-04' },
      { id: 2, description: 'Salary Deposit', amount: 5000.00, date: '2024-03-01' },
      { id: 3, description: 'Electric Bill', amount: -95.20, date: '2024-02-28' },
      { id: 4, description: 'Restaurant', amount: -45.80, date: '2024-02-27' },
    ],
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'bills':
        return <BillsAnalysis />;
      case 'salary':
        return <SalaryJournal />;
      case 'transactions':
        return <TransactionsAnalysis />;
      case 'goals':
        return <GoalsTracker />;
      case 'analytics':
        return <FinancialAnalytics />;
      case 'subscriptions':
        return <SubscriptionManager />;
      case 'investments':
        return <InvestmentPortfolio />;
      case 'plaid':
        return <PlaidIntegration />;
      case 'ask-ai':
        return <AskAI />;
      case 'overview':
      default:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-2">Account Balance</h2>
                <p className="text-2xl font-bold text-indigo-600">
                  ${mockData.accountBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-2">Monthly Income</h2>
                <p className="text-2xl font-bold text-green-600">
                  ${mockData.monthlyIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-2">Monthly Expenses</h2>
                <p className="text-2xl font-bold text-red-600">
                  ${mockData.monthlyExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {mockData.recentTransactions.map(transaction => (
                  <div key={transaction.id} className="px-6 py-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-sm text-gray-500">{transaction.date}</p>
                      </div>
                      <span className={`text-sm font-medium ${
                        transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ${Math.abs(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as DashboardTab)} />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {renderTabContent()}
      </main>
    </div>
  );
};

export default Dashboard; 