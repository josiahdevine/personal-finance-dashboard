import React from 'react';
import { render } from '@testing-library/react';
import Settings from '../Dashboard/Settings';
import Notifications from '../Dashboard/Notifications';
import BudgetPlanning from '../Dashboard/BudgetPlanning';
import AskAI from '../Dashboard/AskAI';
import Analytics from '../Dashboard/Analytics';
import AccountOverview from '../Dashboard/AccountOverview';
import TransactionHistory from '../Dashboard/TransactionHistory';
import RecentActivity from '../Dashboard/RecentActivity';
import GoalTracker from '../Dashboard/GoalTracker';
import InsightCards from '../Dashboard/InsightCards';
import CategoryBreakdown from '../Dashboard/CategoryBreakdown';
import { createTestData } from '../../utils/testUtils';
import {
  TimeFrame,
  TransactionType,
  DisplayMode
} from '../../types/enums';
import type { BudgetProgress } from '../../types';

describe('Visual Regression Tests', () => {
  const mockUser = createTestData.users(1)[0];
  const mockAccounts = createTestData.accounts(3);
  const mockTransactions = createTestData.transactions(5);
  const mockBudgets = createTestData.budgets(3);
  const mockGoals = createTestData.goals(2);

  const mockBudgetProgress: BudgetProgress = {
    spent: 750,
    remaining: 250,
    percentage: 75,
    status: 'warning',
    transactions: mockTransactions.slice(0, 2)
  };

  describe('Settings Component', () => {
    it('renders with user data', () => {
      const { container } = render(
        <Settings
          user={mockUser}
          onSave={jest.fn()}
        />
      );
      expect(container).toMatchSnapshot();
    });

    it('renders loading state', () => {
      const { container } = render(
        <Settings />
      );
      expect(container).toMatchSnapshot();
    });
  });

  describe('Notifications Component', () => {
    it('renders with unread notifications', () => {
      const { container } = render(
        <Notifications
          notifications={createTestData.notifications(3)}
          unreadCount={2}
          onNotificationClick={jest.fn()}
        />
      );
      expect(container).toMatchSnapshot();
    });

    it('renders empty state', () => {
      const { container } = render(
        <Notifications
          notifications={[]}
          unreadCount={0}
        />
      );
      expect(container).toMatchSnapshot();
    });
  });

  describe('BudgetPlanning Component', () => {
    it('renders with budgets and progress', () => {
      const { container } = render(
        <BudgetPlanning
          budgets={mockBudgets}
          budgetProgress={mockBudgetProgress}
          onBudgetClick={jest.fn()}
        />
      );
      expect(container).toMatchSnapshot();
    });

    it('renders loading state', () => {
      const { container } = render(
        <BudgetPlanning
          budgets={[]}
        />
      );
      expect(container).toMatchSnapshot();
    });
  });

  describe('AskAI Component', () => {
    it('renders with processing state', () => {
      const { container } = render(
        <AskAI
          isProcessing={true}
          onQuerySubmit={jest.fn()}
        />
      );
      expect(container).toMatchSnapshot();
    });

    it('renders idle state', () => {
      const { container } = render(
        <AskAI
          isProcessing={false}
        />
      );
      expect(container).toMatchSnapshot();
    });
  });

  describe('Analytics Component', () => {
    it('renders with selected timeframe', () => {
      const { container } = render(
        <Analytics
          timeFrame={TimeFrame.MONTH}
          onTimeFrameChange={jest.fn()}
        />
      );
      expect(container).toMatchSnapshot();
    });

    it('renders loading state', () => {
      const { container } = render(
        <Analytics />
      );
      expect(container).toMatchSnapshot();
    });
  });

  describe('AccountOverview Component', () => {
    it('renders with accounts', () => {
      const { container } = render(
        <AccountOverview
          accounts={mockAccounts}
          onAccountClick={jest.fn()}
        />
      );
      expect(container).toMatchSnapshot();
    });

    it('renders empty state', () => {
      const { container } = render(
        <AccountOverview
          accounts={[]}
        />
      );
      expect(container).toMatchSnapshot();
    });
  });

  describe('TransactionHistory Component', () => {
    it('renders with transactions and filter', () => {
      const { container } = render(
        <TransactionHistory
          transactions={mockTransactions}
          filter={TransactionType.EXPENSE}
          onTransactionClick={jest.fn()}
        />
      );
      expect(container).toMatchSnapshot();
    });

    it('renders loading state', () => {
      const { container } = render(
        <TransactionHistory
          transactions={[]}
        />
      );
      expect(container).toMatchSnapshot();
    });
  });

  describe('RecentActivity Component', () => {
    it('renders with loading state', () => {
      const { container } = render(
        <RecentActivity
          isLoading={true}
          activities={[]}
        />
      );
      expect(container).toMatchSnapshot();
    });

    it('renders with activities', () => {
      const { container } = render(
        <RecentActivity
          isLoading={false}
          activities={mockTransactions.map(t => ({
            id: t.id,
            type: 'transaction',
            title: t.description,
            timestamp: t.date,
            amount: t.amount,
            status: t.status
          }))}
          onActivityClick={jest.fn()}
        />
      );
      expect(container).toMatchSnapshot();
    });
  });

  describe('GoalTracker Component', () => {
    it('renders with goals', () => {
      const { container } = render(
        <GoalTracker
          goals={mockGoals}
          onGoalClick={jest.fn()}
        />
      );
      expect(container).toMatchSnapshot();
    });

    it('renders empty state', () => {
      const { container } = render(
        <GoalTracker
          goals={[]}
        />
      );
      expect(container).toMatchSnapshot();
    });
  });

  describe('InsightCards Component', () => {
    it('renders with display mode', () => {
      const { container } = render(
        <InsightCards
          mode={DisplayMode.DETAILED}
          insights={[
            {
              id: '1',
              title: 'Spending Trend',
              description: 'Your spending has decreased by 15% this month',
              type: 'positive'
            }
          ]}
          onInsightClick={jest.fn()}
        />
      );
      expect(container).toMatchSnapshot();
    });

    it('renders loading state', () => {
      const { container } = render(
        <InsightCards
          mode={DisplayMode.COMPACT}
          insights={[]}
        />
      );
      expect(container).toMatchSnapshot();
    });
  });

  describe('CategoryBreakdown Component', () => {
    it('renders with selected category', () => {
      const { container } = render(
        <CategoryBreakdown
          selectedCategory="groceries"
          categories={[
            {
              id: 'groceries',
              name: 'Groceries',
              amount: 450.75,
              percentage: 25,
              trend: 'up'
            }
          ]}
          onCategoryClick={jest.fn()}
        />
      );
      expect(container).toMatchSnapshot();
    });

    it('renders loading state', () => {
      const { container } = render(
        <CategoryBreakdown
          categories={[]}
        />
      );
      expect(container).toMatchSnapshot();
    });
  });
});
