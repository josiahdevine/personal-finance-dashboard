export interface AppEvent {
  type: string;
  payload?: any;
  timestamp: number;
}

export interface TransactionEvent extends AppEvent {
  type: 'TRANSACTION_CREATED' | 'TRANSACTION_UPDATED' | 'TRANSACTION_DELETED';
  payload: {
    transactionId: string;
    accountId: string;
    amount: number;
    category?: string[];
  };
}

export interface AccountEvent extends AppEvent {
  type: 'ACCOUNT_CONNECTED' | 'ACCOUNT_DISCONNECTED' | 'ACCOUNT_UPDATED';
  payload: {
    accountId: string;
    institutionName?: string;
  };
}

export interface GoalEvent extends AppEvent {
  type: 'GOAL_CREATED' | 'GOAL_UPDATED' | 'GOAL_COMPLETED';
  payload: {
    goalId: string;
    progress: number;
    targetAmount: number;
  };
}

export interface UserEvent extends AppEvent {
  type: 'USER_LOGGED_IN' | 'USER_LOGGED_OUT' | 'USER_UPDATED';
  payload: {
    userId: string;
    email?: string;
  };
} 