import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Navigation from '../../components/navigation/Navigation';
import { AccountSummary } from '../../components/features/dashboard/AccountSummary';
import { HealthScoreWidget } from '../../components/features/dashboard/HealthScoreWidget';
import { RecentTransactionsWidget } from '../../components/features/dashboard/RecentTransactionsWidget';
import { BudgetOverview } from '../../components/features/dashboard/BudgetOverview';
import { CashFlowWidget } from '../../components/features/dashboard/CashFlowWidget';
import { ResponsiveGrid } from '../../components/layout/ResponsiveContainer';
import {
  HomeIcon, 
  CreditCardIcon, 
  CurrencyDollarIcon, 
  ReceiptRefundIcon, 
  FlagIcon, 
  ChartBarIcon, 
  ClockIcon, 
  ArrowTrendingUpIcon, 
  LinkIcon, 
  ChatBubbleLeftRightIcon,
  ShoppingBagIcon,
  AcademicCapIcon,
  HeartIcon,
  LifebuoyIcon,
  TruckIcon // Using TruckIcon instead of CarIcon
} from '@heroicons/react/24/outline';

type DashboardTab = 'overview' | 'bills' | 'salary' | 'transactions' | 'goals' | 'analytics' | 'subscriptions' | 'investments' | 'plaid' | 'ask-ai';

// The tabs in the dashboard
const navigationItems = [
  { name: 'Overview', href: '/dashboard', icon: HomeIcon },
  { name: 'Bills', href: '/dashboard/bills', icon: CreditCardIcon },
  { name: 'Salary Journal', href: '/dashboard/salary', icon: CurrencyDollarIcon },
  { name: 'Transactions', href: '/dashboard/transactions', icon: ReceiptRefundIcon },
  { name: 'Goals', href: '/dashboard/goals', icon: FlagIcon },
  { name: 'Analytics', href: '/dashboard/analytics', icon: ChartBarIcon },
  { name: 'Subscriptions', href: '/dashboard/subscriptions', icon: ClockIcon },
  { name: 'Investments', href: '/dashboard/investments', icon: ArrowTrendingUpIcon },
  { name: 'Plaid Integration', href: '/dashboard/plaid', icon: LinkIcon },
  { name: 'Ask AI', href: '/dashboard/ask-ai', icon: ChatBubbleLeftRightIcon },
];

// Mock data for demo purposes
// In a real app, these would come from API calls or context

// Mock accounts data
const mockAccounts = [
  { id: '1', name: 'Checking Account', type: 'checking', balance: 4250.75, institution: 'Chase' },
  { id: '2', name: 'Savings Account', type: 'savings', balance: 12500.50, institution: 'Chase' },
  { id: '3', name: 'Credit Card', type: 'credit', balance: -1240.33, institution: 'Amex' },
  { id: '4', name: 'Investment Account', type: 'investment', balance: 32750.00, institution: 'Fidelity' },
];

// Total balance calculation
const totalBalance = mockAccounts.reduce((sum, account) => sum + account.balance, 0);

// Mock health score data
const mockHealthScore = {
  score: 78,
  previousScore: 72,
  topRecommendation: 'Increase emergency savings by $500',
};

// Mock budget data
const mockBudgetCategories = [
  { category: 'Housing', spent: 1200, budgeted: 1500, categoryIcon: <HomeIcon className="h-4 w-4" /> },
  { category: 'Food', spent: 450, budgeted: 500, categoryIcon: <ShoppingBagIcon className="h-4 w-4" /> },
  { category: 'Transportation', spent: 180, budgeted: 250, categoryIcon: <TruckIcon className="h-4 w-4" /> },
  { category: 'Education', spent: 300, budgeted: 300, categoryIcon: <AcademicCapIcon className="h-4 w-4" /> },
  { category: 'Healthcare', spent: 150, budgeted: 200, categoryIcon: <HeartIcon className="h-4 w-4" /> },
  { category: 'Insurance', spent: 120, budgeted: 150, categoryIcon: <LifebuoyIcon className="h-4 w-4" /> },
];

// Mock transaction data
const mockTransactions = [
  { 
    id: '1', 
    date: new Date(2023, 6, 15), 
    description: 'Grocery Store', 
    amount: 56.78, 
    category: 'Food',
    type: 'expense' as const,
    accountName: 'Checking'
  },
  { 
    id: '2', 
    date: new Date(2023, 6, 14), 
    description: 'Coffee Shop', 
    amount: 4.50, 
    category: 'Food',
    type: 'expense' as const,
    accountName: 'Credit Card'
  },
  { 
    id: '3', 
    date: new Date(2023, 6, 12), 
    description: 'Paycheck', 
    amount: 2000, 
    category: 'Income',
    type: 'income' as const,
    accountName: 'Checking'
  },
  { 
    id: '4', 
    date: new Date(2023, 6, 10), 
    description: 'Amazon', 
    amount: 35.99, 
    category: 'Shopping',
    type: 'expense' as const,
    accountName: 'Credit Card'
  },
  { 
    id: '5', 
    date: new Date(2023, 6, 8), 
    description: 'Electric Bill', 
    amount: 75.40, 
    category: 'Utilities',
    type: 'expense' as const,
    accountName: 'Checking'
  },
];

// Mock cash flow data
const generateCashFlowData = () => {
  const today = new Date();
  const data = [];
  let balance = 3500;
  
  // Past data (actual)
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    // Add some randomness to the balance
    balance += Math.random() * 200 - 100;
    
    data.push({
      date: new Date(date),
      amount: Math.round(balance * 100) / 100,
      isProjected: false
    });
  }
  
  // Future data (projected)
  let projectedBalance = balance;
  for (let i = 1; i <= 30; i++) {
    const date = new Date();
    date.setDate(today.getDate() + i);
    
    // More variance in projected data
    projectedBalance += Math.random() * 300 - 150;
    
    data.push({
      date: new Date(date),
      amount: Math.round(projectedBalance * 100) / 100,
      isProjected: true
    });
  }
  
  return data;
};

const mockCashFlowData = generateCashFlowData();
const mockCurrentBalance = 3500;
const mockProjectedLow = 2200;
const mockProjectedHigh = 4100;
const mockDaysUntilLow = 12;

const Dashboard: React.FC = () => {
  const { state: { isAuthenticated } } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [isLoading] = useState(false);

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    window.location.href = '/login';
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navigation 
        items={navigationItems} 
        activeTab={activeTab} 
        onTabChange={(tab) => setActiveTab(tab as DashboardTab)} 
      />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="p-4 lg:p-6 max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Welcome back! Here's an overview of your finances.
            </p>
          </div>

          {/* Main Dashboard Grid */}
          <div className="space-y-6">
            {/* Top row - Account Summary */}
            <AccountSummary 
              accounts={mockAccounts}
              totalBalance={totalBalance}
              isLoading={isLoading} 
              onAddAccount={() => console.log('Add account clicked')}
            />

            {/* Middle row - Health Score and Cash Flow */}
            <ResponsiveGrid columns={{ base: 1, lg: 2 }} gap="6">
              <HealthScoreWidget
                score={mockHealthScore.score}
                previousScore={mockHealthScore.previousScore}
                topRecommendation={mockHealthScore.topRecommendation}
                isLoading={isLoading}
                onViewDetails={() => console.log('View health details clicked')}
              />
              <CashFlowWidget
                data={mockCashFlowData}
                currentBalance={mockCurrentBalance}
                projectedLow={mockProjectedLow}
                projectedHigh={mockProjectedHigh}
                daysUntilLow={mockDaysUntilLow}
                isLoading={isLoading}
                onViewDetails={() => console.log('View cash flow details clicked')}
              />
            </ResponsiveGrid>

            {/* Bottom row - Budget Overview and Recent Transactions */}
            <ResponsiveGrid columns={{ base: 1, lg: 2 }} gap="6">
              <BudgetOverview
                budgets={mockBudgetCategories}
                totalSpent={mockBudgetCategories.reduce((acc, curr) => acc + curr.spent, 0)}
                totalBudgeted={mockBudgetCategories.reduce((acc, curr) => acc + curr.budgeted, 0)}
                period="July 2023"
                isLoading={isLoading}
                onViewDetails={() => console.log('View budget details clicked')}
              />
              <RecentTransactionsWidget
                transactions={mockTransactions}
                isLoading={isLoading}
                onViewAll={() => console.log('View all transactions clicked')}
              />
            </ResponsiveGrid>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 