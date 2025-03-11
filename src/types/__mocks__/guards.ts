// Mock implementation of the type guards and validators
// This ensures consistent behavior across testing, development, and production

// Type Guards
export const isUUID = (value: unknown): boolean => {
  if (typeof value !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};

export const isISO8601DateTime = (value: unknown): boolean => {
  if (typeof value !== 'string') return false;
  const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/;
  return iso8601Regex.test(value);
};

export const isCurrency = (value: unknown): boolean => {
  if (typeof value !== 'string') return false;
  const supportedCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY'];
  return supportedCurrencies.includes(value);
};

export const isTransactionType = (value: unknown): boolean => {
  if (typeof value !== 'string') return false;
  const validTypes = ['income', 'expense', 'transfer'];
  return validTypes.includes(value);
};

export const isTransactionStatus = (value: unknown): boolean => {
  if (typeof value !== 'string') return false;
  const validStatuses = ['pending', 'completed', 'canceled', 'failed'];
  return validStatuses.includes(value);
};

export const isAccountType = (value: unknown): boolean => {
  if (typeof value !== 'string') return false;
  const validTypes = ['checking', 'savings', 'credit', 'investment', 'loan', 'other'];
  return validTypes.includes(value);
};

export const isAccountSubtype = (value: unknown): boolean => {
  if (typeof value !== 'string') return false;
  const validSubtypes = ['401k', 'ira', 'creditCard', 'mortgage', 'student', 'auto', 'personal', 'other'];
  return validSubtypes.includes(value);
};

export const isBudgetPeriod = (value: unknown): boolean => {
  if (typeof value !== 'string') return false;
  const validPeriods = ['weekly', 'monthly', 'quarterly', 'yearly'];
  return validPeriods.includes(value);
};

export const isBudgetStatus = (value: unknown): boolean => {
  if (typeof value !== 'string') return false;
  const validStatuses = ['active', 'completed', 'archived'];
  return validStatuses.includes(value);
};

// Type Validators
export const validateUser = (user: any): boolean => {
  if (!user || typeof user !== 'object') return false;
  
  return (
    isUUID(user.uid) &&
    typeof user.email === 'string' &&
    typeof user.displayName === 'string' &&
    typeof user.emailVerified === 'boolean' &&
    (user.createdAt ? isISO8601DateTime(user.createdAt) : true) &&
    (user.updatedAt ? isISO8601DateTime(user.updatedAt) : true)
  );
};

export const validateAccount = (account: any): boolean => {
  if (!account || typeof account !== 'object') return false;
  
  return (
    isUUID(account.id) &&
    isUUID(account.userId) &&
    typeof account.name === 'string' &&
    isAccountType(account.type) &&
    typeof account.balance === 'number' &&
    isCurrency(account.currency) &&
    typeof account.isActive === 'boolean' &&
    isISO8601DateTime(account.lastSync) &&
    isISO8601DateTime(account.createdAt) &&
    isISO8601DateTime(account.updatedAt)
  );
};

export const validateTransaction = (transaction: any): boolean => {
  if (!transaction || typeof transaction !== 'object') return false;
  
  return (
    isUUID(transaction.id) &&
    isUUID(transaction.accountId) &&
    isUUID(transaction.userId) &&
    isISO8601DateTime(transaction.date) &&
    typeof transaction.amount === 'number' &&
    isCurrency(transaction.currency) &&
    typeof transaction.description === 'string' &&
    isTransactionType(transaction.type) &&
    isTransactionStatus(transaction.status) &&
    (transaction.createdAt ? isISO8601DateTime(transaction.createdAt) : true) &&
    (transaction.updatedAt ? isISO8601DateTime(transaction.updatedAt) : true)
  );
};

export const validateBudget = (budget: any): boolean => {
  if (!budget || typeof budget !== 'object') return false;
  
  return (
    isUUID(budget.id) &&
    isUUID(budget.userId) &&
    typeof budget.name === 'string' &&
    typeof budget.amount === 'number' &&
    isCurrency(budget.currency) &&
    isBudgetPeriod(budget.period) &&
    isUUID(budget.categoryId) &&
    isISO8601DateTime(budget.startDate) &&
    isISO8601DateTime(budget.endDate) &&
    typeof budget.isRecurring === 'boolean' &&
    typeof budget.notifications === 'boolean' &&
    (budget.createdAt ? isISO8601DateTime(budget.createdAt) : true) &&
    (budget.updatedAt ? isISO8601DateTime(budget.updatedAt) : true)
  );
};

export const validateApiResponse = (response: any): boolean => {
  if (!response || typeof response !== 'object') return false;
  
  // Validate successful responses
  if (response.data) {
    return typeof response.meta === 'object';
  }
  
  // Validate error responses
  if (response.error) {
    return (
      typeof response.error === 'object' &&
      typeof response.error.code === 'string' &&
      typeof response.error.message === 'string' &&
      typeof response.meta === 'object'
    );
  }
  
  return false;
};
