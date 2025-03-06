import React, { createContext, useContext, useReducer, useCallback } from 'react';

interface AppState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  notifications: Array<{
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    message: string;
  }>;
}

type AppAction =
  | { type: 'TOGGLE_THEME' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'ADD_NOTIFICATION'; payload: Omit<AppState['notifications'][0], 'id'> }
  | { type: 'REMOVE_NOTIFICATION'; payload: string };

const initialState: AppState = {
  theme: 'light',
  sidebarOpen: true,
  notifications: []
};

const AppContext = createContext<{
  state: AppState;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  addNotification: (notification: Omit<AppState['notifications'][0], 'id'>) => void;
  removeNotification: (id: string) => void;
} | null>(null);

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'TOGGLE_THEME':
      return {
        ...state,
        theme: state.theme === 'light' ? 'dark' : 'light'
      };
    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        sidebarOpen: !state.sidebarOpen
      };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [
          ...state.notifications,
          {
            id: Math.random().toString(36).substr(2, 9),
            ...action.payload
          }
        ]
      };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
    default:
      return state;
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const toggleTheme = useCallback(() => {
    dispatch({ type: 'TOGGLE_THEME' });
  }, []);

  const toggleSidebar = useCallback(() => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  }, []);

  const addNotification = useCallback((notification: Omit<AppState['notifications'][0], 'id'>) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
  }, []);

  const removeNotification = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  }, []);

  return (
    <AppContext.Provider
      value={{
        state,
        toggleTheme,
        toggleSidebar,
        addNotification,
        removeNotification
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};