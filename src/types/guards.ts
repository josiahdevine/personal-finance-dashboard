import { 
  User, 
  Account, 
  Transaction, 
  Budget,
  TransactionType,
  TransactionStatus,
  AccountType,
  AccountSubtype,
  BudgetPeriod,
  BudgetStatus,
  ApiResponse,
  ISO8601DateTime,
  UUID,
  Currency
} from './index';

// Type Guards
export const isUUID = (value: unknown): value is UUID => {
  if (typeof value !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
};

export const isISO8601DateTime = (value: unknown): value is ISO8601DateTime => {
  if (typeof value !== 'string') return false;
  const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?(Z|[+-]\d{2}:?\d{2})?$/;
  return iso8601Regex.test(value);
};

export const isCurrency = (value: unknown): value is Currency => {
  if (typeof value !== 'string') return false;
  return ['USD', 'EUR', 'GBP', 'CAD'].includes(value);
};

export const isTransactionType = (value: unknown): value is TransactionType => {
  if (typeof value !== 'string') return false;
  return ['income', 'expense', 'transfer'].includes(value);
};

export const isTransactionStatus = (value: unknown): value is TransactionStatus => {
  if (typeof value !== 'string') return false;
  return ['pending', 'posted', 'cancelled'].includes(value);
};

export const isAccountType = (value: unknown): value is AccountType => {
  if (typeof value !== 'string') return false;
  return ['depository', 'credit', 'loan', 'investment', 'other'].includes(value);
};

export const isAccountSubtype = (value: unknown): value is AccountSubtype => {
  if (typeof value !== 'string') return false;
  return [
    'checking',
    'savings',
    'credit_card',
    'money_market',
    'cd',
    'mortgage',
    'student_loan',
    'auto_loan',
    'brokerage',
    'ira',
    '401k',
    'other'
  ].includes(value);
};

export const isBudgetPeriod = (value: unknown): value is BudgetPeriod => {
  if (typeof value !== 'string') return false;
  return ['daily', 'weekly', 'monthly', 'yearly'].includes(value);
};

export const isBudgetStatus = (value: unknown): value is BudgetStatus => {
  if (typeof value !== 'string') return false;
  return ['on_track', 'warning', 'exceeded'].includes(value);
};

// Type Validators
export const validateUser = (user: unknown): user is User => {
  if (!user || typeof user !== 'object') return false;
  const u = user as User;
  
  return (
    typeof u.uid === 'string' &&
    typeof u.email === 'string' &&
    typeof u.displayName === 'string' &&
    typeof u.emailVerified === 'boolean' &&
    (u.photoURL === undefined || typeof u.photoURL === 'string') &&
    (u.createdAt === undefined || isISO8601DateTime(u.createdAt)) &&
    (u.updatedAt === undefined || isISO8601DateTime(u.updatedAt))
  );
};

export const validateAccount = (account: unknown): account is Account => {
  if (!account || typeof account !== 'object') return false;
  const a = account as Account;
  
  return (
    isUUID(a.id) &&
    isUUID(a.userId) &&
    typeof a.name === 'string' &&
    isAccountType(a.type) &&
    (a.subtype === undefined || isAccountSubtype(a.subtype)) &&
    typeof a.balance === 'number' &&
    isCurrency(a.currency) &&
    typeof a.institution === 'object' &&
    typeof a.isActive === 'boolean' &&
    (a.lastSync === undefined || isISO8601DateTime(a.lastSync)) &&
    isISO8601DateTime(a.createdAt) &&
    isISO8601DateTime(a.updatedAt)
  );
};

export const validateTransaction = (transaction: unknown): transaction is Transaction => {
  if (!transaction || typeof transaction !== 'object') return false;
  const t = transaction as Transaction;
  
  return (
    isUUID(t.id) &&
    isUUID(t.accountId) &&
    isUUID(t.userId) &&
    isISO8601DateTime(t.date) &&
    typeof t.amount === 'number' &&
    isCurrency(t.currency) &&
    typeof t.description === 'string' &&
    typeof t.category === 'object' &&
    isTransactionType(t.type) &&
    isTransactionStatus(t.status) &&
    (t.merchantName === undefined || typeof t.merchantName === 'string') &&
    (t.merchantLogo === undefined || typeof t.merchantLogo === 'string') &&
    (t.location === undefined || typeof t.location === 'object') &&
    (t.tags === undefined || Array.isArray(t.tags)) &&
    (t.notes === undefined || typeof t.notes === 'string') &&
    isISO8601DateTime(t.createdAt) &&
    isISO8601DateTime(t.updatedAt)
  );
};

export const validateBudget = (budget: unknown): budget is Budget => {
  if (!budget || typeof budget !== 'object') return false;
  const b = budget as Budget;
  
  return (
    isUUID(b.id) &&
    isUUID(b.userId) &&
    typeof b.name === 'string' &&
    typeof b.amount === 'number' &&
    isCurrency(b.currency) &&
    isBudgetPeriod(b.period) &&
    (b.categoryId === undefined || isUUID(b.categoryId)) &&
    isISO8601DateTime(b.startDate) &&
    (b.endDate === undefined || isISO8601DateTime(b.endDate)) &&
    typeof b.isRecurring === 'boolean' &&
    typeof b.notifications === 'boolean' &&
    isISO8601DateTime(b.createdAt) &&
    isISO8601DateTime(b.updatedAt)
  );
};

// API Response Validator
export const validateApiResponse = <T>(
  response: unknown,
  dataValidator: (data: unknown) => data is T
): response is ApiResponse<T> => {
  if (!response || typeof response !== 'object') return false;
  const r = response as ApiResponse<T>;
  
  // Validate error if present
  if (r.error !== undefined) {
    if (typeof r.error !== 'object') return false;
    if (typeof r.error.code !== 'string') return false;
    if (typeof r.error.message !== 'string') return false;
  }
  
  // Validate meta if present
  if (r.meta !== undefined) {
    if (typeof r.meta !== 'object') return false;
    if (r.meta.page !== undefined && typeof r.meta.page !== 'number') return false;
    if (r.meta.limit !== undefined && typeof r.meta.limit !== 'number') return false;
    if (r.meta.total !== undefined && typeof r.meta.total !== 'number') return false;
    if (r.meta.hasMore !== undefined && typeof r.meta.hasMore !== 'boolean') return false;
  }
  
  // Validate data if present
  if (r.data !== undefined && !dataValidator(r.data)) return false;
  
  return true;
};
