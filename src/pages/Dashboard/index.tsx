import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { EnhancedHeader } from '../../components/layout/EnhancedHeader';
import { useTheme } from '../../contexts/ThemeContext';
import { AccountSummary } from '../../components/features/dashboard/AccountSummary';
import { HealthScoreWidget } from '../../components/features/dashboard/HealthScoreWidget';
import { RecentTransactionsWidget } from '../../components/features/dashboard/RecentTransactionsWidget';
import { BudgetOverview } from '../../components/features/dashboard/BudgetOverview';
import { CashFlowWidget } from '../../components/features/dashboard/CashFlowWidget';
import { ResponsiveGrid } from '../../components/layout/ResponsiveContainer';
import { Card, ExpandableCard } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { cn } from '../../lib/utils';
import {
  HomeIcon,
  CreditCardIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
  ChartBarIcon,
  CogIcon,
  BellIcon,
  CalendarIcon,
  UserIcon,
  DocumentTextIcon,
  QuestionMarkCircleIcon,
  ArrowPathIcon,
  CurrencyDollarIcon,
  WalletIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import { IconType } from 'react-icons';
import { AnimatePresence, motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';

// Convert Heroicons to IconType compatible format
const iconWrapper = (Icon: React.ElementType): IconType => {
  const WrappedIcon = (props: React.SVGProps<SVGSVGElement>) => <Icon {...props} />;
  return WrappedIcon as unknown as IconType;
};

// The tabs in the dashboard
const navigationItems = [
  { id: 'overview', title: 'Overview', path: '/dashboard', icon: iconWrapper(HomeIcon) },
  { id: 'bills', title: 'Bills', path: '/dashboard/bills', icon: iconWrapper(CreditCardIcon) },
  { id: 'salary', title: 'Salary Journal', path: '/dashboard/salary', icon: iconWrapper(CurrencyDollarIcon) },
  { id: 'transactions', title: 'Transactions', path: '/dashboard/transactions', icon: iconWrapper(CreditCardIcon) },
  { id: 'goals', title: 'Goals', path: '/dashboard/goals', icon: iconWrapper(HomeIcon) },
  { id: 'analytics', title: 'Analytics', path: '/dashboard/analytics', icon: iconWrapper(ChartBarIcon) },
  { id: 'subscriptions', title: 'Subscriptions', path: '/dashboard/subscriptions', icon: iconWrapper(ClockIcon) },
  { id: 'investments', title: 'Investments', path: '/dashboard/investments', icon: iconWrapper(ArrowTrendingUpIcon) },
  { id: 'plaid', title: 'Plaid Integration', path: '/dashboard/plaid', icon: iconWrapper(CreditCardIcon) },
  { id: 'ask-ai', title: 'Ask AI', path: '/dashboard/ask-ai', icon: iconWrapper(ChatBubbleLeftRightIcon) }
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
  { category: 'Food', spent: 450, budgeted: 500, categoryIcon: <CreditCardIcon className="h-4 w-4" /> },
  { category: 'Transportation', spent: 180, budgeted: 250, categoryIcon: <CreditCardIcon className="h-4 w-4" /> },
  { category: 'Education', spent: 300, budgeted: 300, categoryIcon: <CreditCardIcon className="h-4 w-4" /> },
  { category: 'Healthcare', spent: 150, budgeted: 200, categoryIcon: <CreditCardIcon className="h-4 w-4" /> },
  { category: 'Insurance', spent: 120, budgeted: 150, categoryIcon: <CreditCardIcon className="h-4 w-4" /> },
];

// Calculate total spent and budgeted
const totalSpent = mockBudgetCategories.reduce((sum, item) => sum + item.spent, 0);
const totalBudgeted = mockBudgetCategories.reduce((sum, item) => sum + item.budgeted, 0);

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
  const { isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [timeFrame, setTimeFrame] = useState('all');
  const [userName, setUserName] = useState('');

  if (!isAuthenticated) {
    window.location.href = '/login';
    return null;
  }

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const timeFrameOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <EnhancedHeader
        theme={theme}
        onThemeToggle={toggleTheme}
        onMenuClick={toggleSidebar}
        isSidebarCollapsed={sidebarCollapsed}
        className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      />
      
      <div className="flex flex-1">
        {/* Sidebar with animation */}
        <AnimatePresence mode="wait">
          <motion.aside
            key="sidebar"
            initial={{ width: sidebarCollapsed ? 70 : 240 }}
            animate={{ width: sidebarCollapsed ? 70 : 240 }}
            exit={{ width: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed h-[calc(100vh-4rem)] top-16 left-0 z-40 bg-background border-r"
          >
            {navigationItems.map((item) => (
              <NavLink 
                key={item.id}
                to={item.path}
                className={({ isActive }) => cn(
                  "flex items-center h-10 px-4 my-1 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors",
                  isActive && "bg-muted font-medium text-foreground",
                  sidebarCollapsed ? "justify-center" : "justify-start"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!sidebarCollapsed && (
                  <span className="ml-3 truncate">{item.title}</span>
                )}
              </NavLink>
            ))}
          </motion.aside>
        </AnimatePresence>
        
        <main className={cn(
          "flex-1 min-h-[calc(100vh-4rem)] transition-all duration-300",
          sidebarCollapsed ? "ml-[70px]" : "ml-[240px]"
        )}>
          <div className="p-4 md:p-6 max-w-7xl mx-auto">
            {/* Dashboard Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {userName || 'User'}!</p>
            </div>
            
            {/* Time Frame Selector */}
            <div className="mb-6 flex justify-end">
              <Tabs defaultValue="all" className="w-auto">
                <TabsList>
                  {timeFrameOptions.map(option => (
                    <TabsTrigger
                      key={option.value}
                      value={option.value}
                      onClick={() => setTimeFrame(option.value)}
                    >
                      {option.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
            
            {/* Main Dashboard Content */}
            <section className="space-y-6">
              {/* Accounts Overview */}
              <ResponsiveGrid columns={{ base: 1, lg: 2 }} gap="6">
                <AccountSummary 
                  accounts={mockAccounts} 
                  totalBalance={totalBalance}
                  onAccountClick={(id) => console.log('Account clicked:', id)}
                  onAddAccount={() => console.log('Add account clicked')}
                />
                
                <ExpandableCard
                  title="Health Score"
                  description="Overall financial health assessment"
                  defaultExpanded={true}
                  headerActions={
                    <Button variant="ghost" size="sm" onClick={() => console.log('Health details')}>
                      Details
                    </Button>
                  }
                >
                  <div className="flex flex-col items-center py-6">
                    <div className="relative mb-4">
                      <svg className="w-40 h-40">
                        <circle
                          className="text-muted stroke-current"
                          strokeWidth="8"
                          strokeLinecap="round"
                          fill="transparent"
                          r="70"
                          cx="80"
                          cy="80"
                        />
                        <circle
                          className="text-primary stroke-current"
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={440}
                          strokeDashoffset={440 - (440 * mockHealthScore.score) / 100}
                          fill="transparent"
                          r="70"
                          cx="80"
                          cy="80"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-4xl font-bold">{mockHealthScore.score}</span>
                        <span className="text-muted-foreground text-sm">out of 100</span>
                      </div>
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-muted-foreground">
                        {mockHealthScore.score > mockHealthScore.previousScore 
                          ? `+${mockHealthScore.score - mockHealthScore.previousScore} since last month` 
                          : `${mockHealthScore.score - mockHealthScore.previousScore} since last month`}
                      </p>
                      <div className="border p-3 rounded-md bg-muted/30">
                        <p className="font-medium">Top Recommendation</p>
                        <p className="text-sm text-muted-foreground">{mockHealthScore.topRecommendation}</p>
                      </div>
                    </div>
                  </div>
                </ExpandableCard>
              </ResponsiveGrid>
              
              {/* Budget & Transactions */}
              <ResponsiveGrid columns={{ base: 1, lg: 2 }} gap="6">
                <BudgetOverview 
                  budgets={mockBudgetCategories} 
                  totalSpent={totalSpent}
                  totalBudgeted={totalBudgeted}
                  period={timeFrame === 'month' ? 'This Month' : timeFrame === 'year' ? 'This Year' : 'All Time'}
                />
                
                <RecentTransactionsWidget 
                  transactions={mockTransactions} 
                />
              </ResponsiveGrid>
              
              {/* Cash Flow & Goals */}
              <ResponsiveGrid columns={{ base: 1, lg: 2 }} gap="6">
                <CashFlowWidget 
                  data={mockCashFlowData}
                  currentBalance={mockCurrentBalance}
                  projectedLow={mockProjectedLow}
                  projectedHigh={mockProjectedHigh}
                  daysUntilLow={mockDaysUntilLow}
                  timeframe={timeFrame === 'month' ? '30d' : timeFrame === 'year' ? '90d' : '7d'}
                />
                
                <ExpandableCard
                  title="Upcoming Bills"
                  description="Your scheduled payments"
                  defaultExpanded={true}
                  headerActions={
                    <Button variant="ghost" size="sm" onClick={() => console.log('View all bills')}>
                      View All
                    </Button>
                  }
                >
                  <div className="space-y-4 py-2">
                    {[
                      { name: 'Rent', amount: 1200, due: '2023-12-01', paid: false },
                      { name: 'Internet', amount: 75, due: '2023-12-05', paid: false },
                      { name: 'Phone', amount: 85, due: '2023-12-10', paid: false },
                    ].map((bill, index) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between p-3 border rounded-md"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{bill.name}</span>
                          <span className="text-sm text-muted-foreground">
                            Due {new Date(bill.due).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-medium">${bill.amount}</span>
                          <Button 
                            variant={bill.paid ? "ghost" : "default"} 
                            size="sm"
                          >
                            {bill.paid ? 'Paid' : 'Pay Now'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ExpandableCard>
              </ResponsiveGrid>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard; 