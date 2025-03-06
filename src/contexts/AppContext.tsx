import React, { createContext, useContext, useReducer } from 'react';
import { AuthState, PlaidState, TransactionsState, GoalsState } from '../types/states';
import { User, PlaidAccount, Transaction, Goal } from '../types/models';
import { ThemeMode } from '../types/theme';
import { Alert } from '../types/alert';

interface UIState {
  theme: ThemeMode;
  isSidebarOpen: boolean;
  alerts: Alert[];
}

interface AppState {
  auth: AuthState;
  plaid: PlaidState;
  transactions: TransactionsState;
  goals: GoalsState;
  ui: UIState;
}

type AppAction =
  | { type: 'AUTH_SET_USER'; payload: User | null }
  | { type: 'AUTH_SET_LOADING'; payload: boolean }
  | { type: 'AUTH_SET_ERROR'; payload: string | null }
  | { type: 'PLAID_SET_ACCOUNTS'; payload: PlaidAccount[] }
  | { type: 'PLAID_SET_LOADING'; payload: boolean }
  | { type: 'PLAID_SET_ERROR'; payload: string | null }
  | { type: 'TRANSACTIONS_SET'; payload: Transaction[] }
  | { type: 'TRANSACTIONS_SET_LOADING'; payload: boolean }
  | { type: 'TRANSACTIONS_SET_ERROR'; payload: string | null }
  | { type: 'GOALS_SET'; payload: Goal[] }
  | { type: 'GOALS_SET_LOADING'; payload: boolean }
  | { type: 'GOALS_SET_ERROR'; payload: string | null }
  | { type: 'GOALS_ADD'; payload: Goal }
  | { type: 'GOALS_UPDATE'; payload: { id: string; updates: Partial<Goal> } }
  | { type: 'GOALS_DELETE'; payload: string }
  | { type: 'UI_SET_THEME'; payload: ThemeMode }
  | { type: 'UI_SET_SIDEBAR_OPEN'; payload: boolean }
  | { type: 'UI_ADD_ALERT'; payload: Alert }
  | { type: 'UI_REMOVE_ALERT'; payload: string };

const initialState: AppState = {
  auth: {
    user: null,
    isLoading: false,
    error: null
  },
  plaid: {
    accounts: [],
    isLoading: false,
    error: null
  },
  transactions: {
    items: [],
    isLoading: false,
    error: null
  },
  goals: {
    items: [],
    isLoading: false,
    error: null
  },
  ui: {
    theme: 'system',
    isSidebarOpen: false,
    alerts: []
  }
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'AUTH_SET_USER':
      return {
        ...state,
        auth: {
          ...state.auth,
          user: action.payload
        }
      };
    case 'AUTH_SET_LOADING':
      return {
        ...state,
        auth: {
          ...state.auth,
          isLoading: action.payload
        }
      };
    case 'AUTH_SET_ERROR':
      return {
        ...state,
        auth: {
          ...state.auth,
          error: action.payload
        }
      };
    case 'PLAID_SET_ACCOUNTS':
      return {
        ...state,
        plaid: {
          ...state.plaid,
          accounts: action.payload
        }
      };
    case 'PLAID_SET_LOADING':
      return {
        ...state,
        plaid: {
          ...state.plaid,
          isLoading: action.payload
        }
      };
    case 'PLAID_SET_ERROR':
      return {
        ...state,
        plaid: {
          ...state.plaid,
          error: action.payload
        }
      };
    case 'TRANSACTIONS_SET':
      return {
        ...state,
        transactions: {
          ...state.transactions,
          items: action.payload
        }
      };
    case 'TRANSACTIONS_SET_LOADING':
      return {
        ...state,
        transactions: {
          ...state.transactions,
          isLoading: action.payload
        }
      };
    case 'TRANSACTIONS_SET_ERROR':
      return {
        ...state,
        transactions: {
          ...state.transactions,
          error: action.payload
        }
      };
    case 'GOALS_SET':
      return {
        ...state,
        goals: {
          ...state.goals,
          items: action.payload
        }
      };
    case 'GOALS_SET_LOADING':
      return {
        ...state,
        goals: {
          ...state.goals,
          isLoading: action.payload
        }
      };
    case 'GOALS_SET_ERROR':
      return {
        ...state,
        goals: {
          ...state.goals,
          error: action.payload
        }
      };
    case 'GOALS_ADD':
      return {
        ...state,
        goals: {
          ...state.goals,
          items: [...state.goals.items, action.payload]
        }
      };
    case 'GOALS_UPDATE':
      return {
        ...state,
        goals: {
          ...state.goals,
          items: state.goals.items.map(goal =>
            goal.id === action.payload.id
              ? { ...goal, ...action.payload.updates }
              : goal
          )
        }
      };
    case 'GOALS_DELETE':
      return {
        ...state,
        goals: {
          ...state.goals,
          items: state.goals.items.filter(goal => goal.id !== action.payload)
        }
      };
    case 'UI_SET_THEME':
      return {
        ...state,
        ui: {
          ...state.ui,
          theme: action.payload
        }
      };
    case 'UI_SET_SIDEBAR_OPEN':
      return {
        ...state,
        ui: {
          ...state.ui,
          isSidebarOpen: action.payload
        }
      };
    case 'UI_ADD_ALERT':
      return {
        ...state,
        ui: {
          ...state.ui,
          alerts: [...state.ui.alerts, action.payload]
        }
      };
    case 'UI_REMOVE_ALERT':
      return {
        ...state,
        ui: {
          ...state.ui,
          alerts: state.ui.alerts.filter(alert => alert.id !== action.payload)
        }
      };
    default:
      return state;
  }
};

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};