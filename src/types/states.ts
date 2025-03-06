import { User, PlaidAccount, Transaction, Goal } from './models';
import { ThemeMode } from './theme';
import { Alert } from './alert';

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface PlaidState {
  accounts: PlaidAccount[];
  isLoading: boolean;
  error: string | null;
}

export interface TransactionsState {
  items: Transaction[];
  isLoading: boolean;
  error?: string | null;
}

export interface GoalsState {
  items: Goal[];
  isLoading: boolean;
  error?: string | null;
}

export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  categories?: string[];
  accounts?: string[];
  searchTerm?: string;
}

export interface UIState {
  theme: ThemeMode;
  isSidebarOpen: boolean;
  activeModal?: string | null;
  alerts: Alert[];
} 