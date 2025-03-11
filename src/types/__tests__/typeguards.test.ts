import {
  isUUID,
  isISO8601DateTime,
  isCurrency,
  isTransactionType,
  isTransactionStatus,
  isAccountType,
  isAccountSubtype,
  isBudgetPeriod,
  isBudgetStatus,
  validateUser,
  validateAccount,
  validateTransaction,
  validateBudget,
  validateApiResponse
} from '../guards';

describe('Type Guards', () => {
  describe('isUUID', () => {
    test('validates correct UUIDs', () => {
      expect(isUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
    });

    test('rejects invalid formats', () => {
      expect(isUUID('not-a-uuid')).toBe(false);
      expect(isUUID('')).toBe(false);
      expect(isUUID(null as unknown as string)).toBe(false);
      expect(isUUID(undefined as unknown as string)).toBe(false);
      expect(isUUID(123 as unknown as string)).toBe(false);
    });
  });

  describe('isISO8601DateTime', () => {
    test('validates correct ISO 8601 date times', () => {
      expect(isISO8601DateTime('2023-04-15T14:32:17Z')).toBe(true);
      expect(isISO8601DateTime('2023-04-15T14:32:17.123Z')).toBe(true);
      expect(isISO8601DateTime('2023-04-15T14:32:17+02:00')).toBe(true);
    });

    test('rejects invalid formats', () => {
      expect(isISO8601DateTime('2023-04-15')).toBe(false); // Missing time part
      expect(isISO8601DateTime('14:32:17')).toBe(false); // Missing date part
      expect(isISO8601DateTime('2023/04/15T14:32:17Z')).toBe(false); // Wrong separator
      expect(isISO8601DateTime('')).toBe(false);
      expect(isISO8601DateTime(null as unknown as string)).toBe(false);
    });
  });

  describe('isCurrency', () => {
    test('validates supported currencies', () => {
      expect(isCurrency('USD')).toBe(true);
      expect(isCurrency('EUR')).toBe(true);
      expect(isCurrency('GBP')).toBe(true);
    });

    test('rejects unsupported currencies', () => {
      expect(isCurrency('XYZ')).toBe(false);
      expect(isCurrency('USDT')).toBe(false); // Not in the list
      expect(isCurrency('')).toBe(false);
      expect(isCurrency(null as unknown as string)).toBe(false);
    });
  });

  describe('Transaction Type Guards', () => {
    test('validates transaction types', () => {
      expect(isTransactionType('income')).toBe(true);
      expect(isTransactionType('expense')).toBe(true);
      expect(isTransactionType('transfer')).toBe(true);
      expect(isTransactionType('invalid-type')).toBe(false);
      expect(isTransactionType('')).toBe(false);
    });

    test('validates transaction statuses', () => {
      expect(isTransactionStatus('pending')).toBe(true);
      expect(isTransactionStatus('completed')).toBe(true);
      expect(isTransactionStatus('canceled')).toBe(true);
      expect(isTransactionStatus('invalid-status')).toBe(false);
      expect(isTransactionStatus('')).toBe(false);
    });
  });

  describe('Account Type Guards', () => {
    test('validates account types', () => {
      expect(isAccountType('checking')).toBe(true);
      expect(isAccountType('savings')).toBe(true);
      expect(isAccountType('credit')).toBe(true);
      expect(isAccountType('investment')).toBe(true);
      expect(isAccountType('invalid-type')).toBe(false);
      expect(isAccountType('')).toBe(false);
    });

    test('validates account subtypes', () => {
      expect(isAccountSubtype('401k')).toBe(true);
      expect(isAccountSubtype('ira')).toBe(true);
      expect(isAccountSubtype('creditCard')).toBe(true);
      expect(isAccountSubtype('invalid-subtype')).toBe(false);
      expect(isAccountSubtype('')).toBe(false);
    });
  });

  describe('Budget Type Guards', () => {
    test('validates budget periods', () => {
      expect(isBudgetPeriod('weekly')).toBe(true);
      expect(isBudgetPeriod('monthly')).toBe(true);
      expect(isBudgetPeriod('quarterly')).toBe(true);
      expect(isBudgetPeriod('yearly')).toBe(true);
      expect(isBudgetPeriod('invalid-period')).toBe(false);
      expect(isBudgetPeriod('')).toBe(false);
    });

    test('validates budget statuses', () => {
      expect(isBudgetStatus('active')).toBe(true);
      expect(isBudgetStatus('completed')).toBe(true);
      expect(isBudgetStatus('archived')).toBe(true);
      expect(isBudgetStatus('invalid-status')).toBe(false);
      expect(isBudgetStatus('')).toBe(false);
    });
  });
});

describe('Object Validators', () => {
  describe('validateUser', () => {
    test('validates a complete and valid user object', () => {
      const validUser = {
        uid: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        displayName: 'Test User',
        emailVerified: true,
        createdAt: '2023-04-15T14:32:17Z',
        updatedAt: '2023-04-15T14:32:17Z'
      };
      
      expect(validateUser(validUser)).toBe(true);
    });

    test('validates a minimal valid user object', () => {
      const minimalUser = {
        uid: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        displayName: 'Test User',
        emailVerified: true
      };
      
      expect(validateUser(minimalUser)).toBe(true);
    });

    test('rejects invalid user objects', () => {
      // Invalid UUID
      expect(validateUser({
        uid: 'not-a-uuid',
        email: 'test@example.com',
        displayName: 'Test User',
        emailVerified: true
      })).toBe(false);
      
      // Missing required fields
      expect(validateUser({
        uid: '123e4567-e89b-12d3-a456-426614174000',
        // Missing email
        displayName: 'Test User',
        emailVerified: true
      })).toBe(false);
      
      // Invalid date formats
      expect(validateUser({
        uid: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        displayName: 'Test User',
        emailVerified: true,
        createdAt: '2023-04-15', // Invalid format
        updatedAt: '2023-04-15T14:32:17Z'
      })).toBe(false);
      
      // Non-object values
      expect(validateUser(null)).toBe(false);
      expect(validateUser(undefined)).toBe(false);
      expect(validateUser('string')).toBe(false);
      expect(validateUser(123)).toBe(false);
    });
  });

  describe('validateAccount', () => {
    test('validates a complete and valid account object', () => {
      const validAccount = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: '123e4567-e89b-12d3-a456-426614174001',
        name: 'Checking Account',
        type: 'checking',
        balance: 1000,
        currency: 'USD',
        isActive: true,
        institution: { id: 'inst-1', name: 'Test Bank' },
        lastSync: '2023-04-15T14:32:17Z',
        createdAt: '2023-04-15T14:32:17Z',
        updatedAt: '2023-04-15T14:32:17Z'
      };
      
      expect(validateAccount(validAccount)).toBe(true);
    });

    test('rejects invalid account objects', () => {
      // Invalid account type
      expect(validateAccount({
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: '123e4567-e89b-12d3-a456-426614174001',
        name: 'Checking Account',
        type: 'invalid-type', // Invalid type
        balance: 1000,
        currency: 'USD',
        isActive: true,
        lastSync: '2023-04-15T14:32:17Z',
        createdAt: '2023-04-15T14:32:17Z',
        updatedAt: '2023-04-15T14:32:17Z'
      })).toBe(false);
      
      // Invalid currency
      expect(validateAccount({
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: '123e4567-e89b-12d3-a456-426614174001',
        name: 'Checking Account',
        type: 'checking',
        balance: 1000,
        currency: 'XYZ', // Invalid currency
        isActive: true,
        lastSync: '2023-04-15T14:32:17Z',
        createdAt: '2023-04-15T14:32:17Z',
        updatedAt: '2023-04-15T14:32:17Z'
      })).toBe(false);
    });
  });

  describe('validateTransaction', () => {
    test('validates a complete and valid transaction object', () => {
      const validTransaction = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        accountId: '123e4567-e89b-12d3-a456-426614174001',
        userId: '123e4567-e89b-12d3-a456-426614174002',
        date: '2023-04-15T14:32:17Z',
        amount: 1500,
        currency: 'USD',
        description: 'Salary payment',
        category: { id: '1', name: 'Income' },
        type: 'income',
        status: 'completed',
        createdAt: '2023-04-15T14:32:17Z',
        updatedAt: '2023-04-15T14:32:17Z'
      };
      
      expect(validateTransaction(validTransaction)).toBe(true);
    });

    test('rejects invalid transaction objects', () => {
      // Invalid date format
      expect(validateTransaction({
        id: '123e4567-e89b-12d3-a456-426614174000',
        accountId: '123e4567-e89b-12d3-a456-426614174001',
        userId: '123e4567-e89b-12d3-a456-426614174002',
        date: '2023-04-15', // Invalid date format
        amount: 1500,
        currency: 'USD',
        description: 'Salary payment',
        category: { id: '1', name: 'Income' },
        type: 'income',
        status: 'completed',
        createdAt: '2023-04-15T14:32:17Z',
        updatedAt: '2023-04-15T14:32:17Z'
      })).toBe(false);
      
      // Invalid transaction type
      expect(validateTransaction({
        id: '123e4567-e89b-12d3-a456-426614174000',
        accountId: '123e4567-e89b-12d3-a456-426614174001',
        userId: '123e4567-e89b-12d3-a456-426614174002',
        date: '2023-04-15T14:32:17Z',
        amount: 1500,
        currency: 'USD',
        description: 'Salary payment',
        category: { id: '1', name: 'Income' },
        type: 'invalid-type', // Invalid type
        status: 'completed',
        createdAt: '2023-04-15T14:32:17Z',
        updatedAt: '2023-04-15T14:32:17Z'
      })).toBe(false);
    });
  });

  describe('validateBudget', () => {
    test('validates a complete and valid budget object', () => {
      const validBudget = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: '123e4567-e89b-12d3-a456-426614174001',
        name: 'Monthly Budget',
        amount: 2000,
        currency: 'USD',
        period: 'monthly',
        categoryId: '123e4567-e89b-12d3-a456-426614174003',
        startDate: '2023-04-15T14:32:17Z',
        endDate: '2023-05-15T14:32:17Z',
        isRecurring: true,
        notifications: true,
        createdAt: '2023-04-15T14:32:17Z',
        updatedAt: '2023-04-15T14:32:17Z'
      };
      
      expect(validateBudget(validBudget)).toBe(true);
    });

    test('rejects invalid budget objects', () => {
      // Invalid budget period
      expect(validateBudget({
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: '123e4567-e89b-12d3-a456-426614174001',
        name: 'Monthly Budget',
        amount: 2000,
        currency: 'USD',
        period: 'invalid-period', // Invalid period
        categoryId: '123e4567-e89b-12d3-a456-426614174003',
        startDate: '2023-04-15T14:32:17Z',
        endDate: '2023-05-15T14:32:17Z',
        isRecurring: true,
        notifications: true,
        createdAt: '2023-04-15T14:32:17Z',
        updatedAt: '2023-04-15T14:32:17Z'
      })).toBe(false);
    });
  });

  describe('validateApiResponse', () => {
    test('validates a successful API response', () => {
      const successResponse = {
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Test Data'
        },
        meta: {
          timestamp: '2023-04-15T14:32:17Z',
          requestId: '123e4567-e89b-12d3-a456-426614174001'
        }
      };
      
      expect(validateApiResponse(successResponse)).toBe(true);
    });

    test('validates an error API response', () => {
      const errorResponse = {
        error: {
          code: 'NOT_FOUND',
          message: 'Resource not found'
        },
        meta: {
          timestamp: '2023-04-15T14:32:17Z',
          requestId: '123e4567-e89b-12d3-a456-426614174001'
        }
      };
      
      expect(validateApiResponse(errorResponse)).toBe(true);
    });

    test('rejects invalid API responses', () => {
      // Missing data or error
      expect(validateApiResponse({
        meta: {
          timestamp: '2023-04-15T14:32:17Z',
          requestId: '123e4567-e89b-12d3-a456-426614174001'
        }
      })).toBe(false);
      
      // Missing meta
      expect(validateApiResponse({
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Test Data'
        }
      })).toBe(false);
      
      // Non-object error
      expect(validateApiResponse({
        error: 'Something went wrong', // Not an object
        meta: {
          timestamp: '2023-04-15T14:32:17Z',
          requestId: '123e4567-e89b-12d3-a456-426614174001'
        }
      })).toBe(false);
    });
  });
});
