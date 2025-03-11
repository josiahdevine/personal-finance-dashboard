import type { ReactNode } from 'react';
import type {
  User,
  Account,
  Transaction,
  Budget,
  Goal,
  BudgetProgress,
  TimeFrame,
  Currency
} from './index';
import { DisplayMode } from './enums';

// Common Props
export interface BaseComponentProps {
  className?: string;
  style?: React.CSSProperties;
  testId?: string;
}

// Dashboard Component Props
export interface SettingsProps extends BaseComponentProps {
  user?: User;
  onSave?: (settings: User['preferences']) => void;
}

export interface SalaryJournalProps extends BaseComponentProps {
  transactions: Transaction[];
  onTransactionClick?: (transaction: Transaction) => void;
}

export interface NotificationsProps extends BaseComponentProps {
  unreadNotificationCount?: number;
  onNotificationClick?: (notificationId: string) => void;
}

export interface BudgetPlanningProps extends BaseComponentProps {
  budgets: Budget[];
  budgetProgress?: BudgetProgress;
  onBudgetClick?: (budget: Budget) => void;
}

export interface AskAIProps extends BaseComponentProps {
  isProcessingQuery?: boolean;
  onQuerySubmit?: (query: string) => void;
}

export interface AnalyticsProps extends BaseComponentProps {
  selectedTimeFrame?: TimeFrame;
  onTimeFrameChange?: (timeFrame: TimeFrame) => void;
}

export interface AccountOverviewProps extends BaseComponentProps {
  accounts: Account[];
  onAccountClick?: (account: Account) => void;
}

export interface TransactionHistoryProps extends BaseComponentProps {
  transactions: Transaction[];
  transactionTypeFilter?: string;
  onTransactionClick?: (transaction: Transaction) => void;
}

export interface RecentActivityProps extends BaseComponentProps {
  isLoadingActivities?: boolean;
  onActivityClick?: (activityId: string) => void;
}

export interface GoalTrackerProps extends BaseComponentProps {
  goals: Goal[];
  onGoalClick?: (goal: Goal) => void;
}

export interface InsightCardsProps extends BaseComponentProps {
  displayMode?: DisplayMode;
  onInsightClick?: (insightId: string) => void;
}

export interface CategoryBreakdownProps extends BaseComponentProps {
  selectedCategoryId?: string;
  onCategoryClick?: (categoryId: string) => void;
}

// Form Component Props
export interface FormFieldProps extends BaseComponentProps {
  label: string;
  name: string;
  type?: 'text' | 'number' | 'email' | 'password' | 'select' | 'textarea';
  value?: string | number;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  onChange?: (value: string | number) => void;
}

export interface SelectFieldProps extends FormFieldProps {
  options: Array<{ label: string; value: string | number }>;
}

// Data Display Props
export interface ChartProps extends BaseComponentProps {
  data: Array<{ date: string; value: number }>;
  type?: 'line' | 'bar' | 'pie';
  height?: number;
  width?: number;
}

export interface StatCardProps extends BaseComponentProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  currency?: Currency;
}

// Feedback Component Props
export interface LoadingProps extends BaseComponentProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
}

export interface ErrorProps extends BaseComponentProps {
  title?: string;
  message: string;
  retry?: () => void;
}

export interface EmptyStateProps extends BaseComponentProps {
  title: string;
  message?: string;
  action?: ReactNode;
}
