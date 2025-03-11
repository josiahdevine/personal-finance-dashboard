// Account Types
export enum AccountType {
  CHECKING = 'CHECKING',
  SAVINGS = 'SAVINGS',
  CREDIT = 'CREDIT',
  INVESTMENT = 'INVESTMENT',
  LOAN = 'LOAN',
  DEPOSITORY = 'DEPOSITORY'
}

export enum AccountSubtype {
  CHECKING = 'CHECKING',
  SAVINGS = 'SAVINGS',
  CREDIT_CARD = 'CREDIT_CARD',
  MONEY_MARKET = 'MONEY_MARKET',
  CD = 'CD',
  BROKERAGE = 'BROKERAGE',
  MORTGAGE = 'MORTGAGE',
  STUDENT_LOAN = 'STUDENT_LOAN',
  PERSONAL_LOAN = 'PERSONAL_LOAN'
}

// Transaction Types
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  POSTED = 'POSTED',
  CANCELLED = 'CANCELLED'
}

// Budget Types
export enum BudgetPeriod {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY'
}

export enum BudgetStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED'
}

// Goal Types
export enum GoalStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

// Notification Types
export enum NotificationType {
  TRANSACTION = 'TRANSACTION',
  BUDGET_ALERT = 'BUDGET_ALERT',
  GOAL_PROGRESS = 'GOAL_PROGRESS',
  BILL_DUE = 'BILL_DUE',
  SECURITY = 'SECURITY',
  SYSTEM = 'SYSTEM'
}

export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

// Currency Types
export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  CAD = 'CAD'
}

// Add DisplayMode enum
export enum DisplayMode {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system'
}
