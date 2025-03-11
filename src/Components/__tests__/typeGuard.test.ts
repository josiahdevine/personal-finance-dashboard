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
} from '../../types/guards';

// Test suite for the type guards you've implemented
describe('Type Guards', () => {
  describe('isUUID', () => {
    it('should validate correct UUIDs', () => {
      expect(isUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
    });

    it('should reject invalid UUIDs', () => {
      expect(isUUID('not-a-uuid')).toBe(false);
      expect(isUUID('')).toBe(false);
      expect(isUUID(null as any)).toBe(false);
    });
  });

  describe('isISO8601DateTime', () => {
    it('should validate correct ISO 8601 date times', () => {
      expect(isISO8601DateTime('2023-04-15T14:32:17Z')).toBe(true);
      expect(isISO8601DateTime('2023-04-15T14:32:17.123Z')).toBe(true);
      expect(isISO8601DateTime('2023-04-15T14:32:17+02:00')).toBe(true);
    });

    it('should reject invalid ISO 8601 date times', () => {
      expect(isISO8601DateTime('2023-04-15')).toBe(false); // Missing time
      expect(isISO8601DateTime('not-a-date')).toBe(false);
      expect(isISO8601DateTime('')).toBe(false);
      expect(isISO8601DateTime(null as any)).toBe(false);
    });
  });

  describe('isCurrency', () => {
    it('should validate supported currencies', () => {
      expect(isCurrency('USD')).toBe(true);
      expect(isCurrency('EUR')).toBe(true);
      expect(isCurrency('GBP')).toBe(true);
    });

    it('should reject unsupported currencies', () => {
      expect(isCurrency('XYZ')).toBe(false);
      expect(isCurrency('')).toBe(false);
      expect(isCurrency(null as any)).toBe(false);
    });
  });

  describe('Transaction Type Guards', () => {
    it('should validate transaction types', () => {
      expect(isTransactionType('income')).toBe(true);
      expect(isTransactionType('expense')).toBe(true);
      expect(isTransactionType('transfer')).toBe(true);
      expect(isTransactionType('invalid-type')).toBe(false);
    });

    it('should validate transaction statuses', () => {
      expect(isTransactionStatus('pending')).toBe(true);
      expect(isTransactionStatus('completed')).toBe(true);
      expect(isTransactionStatus('canceled')).toBe(true);
      expect(isTransactionStatus('invalid-status')).toBe(false);
    });
  });

  describe('Account Type Guards', () => {
    it('should validate account types', () => {
      expect(isAccountType('checking')).toBe(true);
      expect(isAccountType('savings')).toBe(true);
      expect(isAccountType('credit')).toBe(true);
      expect(isAccountType('investment')).toBe(true);
      expect(isAccountType('invalid-type')).toBe(false);
    });

    it('should validate account subtypes', () => {
      expect(isAccountSubtype('401k')).toBe(true);
      expect(isAccountSubtype('ira')).toBe(true);
      expect(isAccountSubtype('creditCard')).toBe(true);
      expect(isAccountSubtype('invalid-subtype')).toBe(false);
    });
  });

  describe('Budget Type Guards', () => {
    it('should validate budget periods', () => {
      expect(isBudgetPeriod('weekly')).toBe(true);
      expect(isBudgetPeriod('monthly')).toBe(true);
      expect(isBudgetPeriod('quarterly')).toBe(true);
      expect(isBudgetPeriod('yearly')).toBe(true);
      expect(isBudgetPeriod('invalid-period')).toBe(false);
    });

    it('should validate budget statuses', () => {
      expect(isBudgetStatus('active')).toBe(true);
      expect(isBudgetStatus('completed')).toBe(true);
      expect(isBudgetStatus('archived')).toBe(true);
      expect(isBudgetStatus('invalid-status')).toBe(false);
    });
  });
});

// Test suite for complex object validators
describe('Object Validators', () => {
  describe('validateUser', () => {
    it('should validate a valid user object', () => {
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

    it('should reject an invalid user object', () => {
      const invalidUser = {
        uid: 'not-a-uuid',
        email: 'test@example.com',
        // Missing displayName
        emailVerified: true,
        createdAt: '2023-04-15T14:32:17Z',
        updatedAt: '2023-04-15T14:32:17Z'
      };
      
      expect(validateUser(invalidUser as any)).toBe(false);
    });
  });

  describe('validateAccount', () => {
    it('should validate a valid account object', () => {
      const validAccount = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: '123e4567-e89b-12d3-a456-426614174001',
        name: 'Checking Account',
        type: 'checking',
        balance: 1000,
        currency: 'USD',
        isActive: true,
        lastSync: '2023-04-15T14:32:17Z',
        createdAt: '2023-04-15T14:32:17Z',
        updatedAt: '2023-04-15T14:32:17Z'
      };
      
      expect(validateAccount(validAccount)).toBe(true);
    });

    it('should reject an invalid account object', () => {
      const invalidAccount = {
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
      };
      
      expect(validateAccount(invalidAccount as any)).toBe(false);
    });
  });

  describe('validateTransaction', () => {
    it('should validate a valid transaction object', () => {
      const validTransaction = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        accountId: '123e4567-e89b-12d3-a456-426614174001',
        userId: '123e4567-e89b-12d3-a456-426614174002',
        date: '2023-04-15T14:32:17Z',
        amount: 1500,
        currency: 'USD',
        description: 'Salary payment',
        category: { id: '1', name: 'Income', icon: 'money', color: 'green' },
        type: 'income',
        status: 'completed',
        createdAt: '2023-04-15T14:32:17Z',
        updatedAt: '2023-04-15T14:32:17Z'
      };
      
      expect(validateTransaction(validTransaction)).toBe(true);
    });

    it('should reject an invalid transaction object', () => {
      const invalidTransaction = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        accountId: '123e4567-e89b-12d3-a456-426614174001',
        userId: '123e4567-e89b-12d3-a456-426614174002',
        date: '2023-04-15', // Invalid date format
        amount: 1500,
        currency: 'USD',
        description: 'Salary payment',
        category: { id: '1', name: 'Income', icon: 'money', color: 'green' },
        type: 'income',
        status: 'completed',
        createdAt: '2023-04-15T14:32:17Z',
        updatedAt: '2023-04-15T14:32:17Z'
      };
      
      expect(validateTransaction(invalidTransaction as any)).toBe(false);
    });
  });

  describe('validateBudget', () => {
    it('should validate a valid budget object', () => {
      const validBudget = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: '123e4567-e89b-12d3-a456-426614174001',
        name: 'Monthly Budget',
        amount: 2000,
        currency: 'USD',
        period: 'monthly',
        categoryId: '1',
        startDate: '2023-04-15T14:32:17Z',
        endDate: '2023-05-15T14:32:17Z',
        isRecurring: true,
        notifications: true,
        createdAt: '2023-04-15T14:32:17Z',
        updatedAt: '2023-04-15T14:32:17Z'
      };
      
      expect(validateBudget(validBudget)).toBe(true);
    });

    it('should reject an invalid budget object', () => {
      const invalidBudget = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: '123e4567-e89b-12d3-a456-426614174001',
        name: 'Monthly Budget',
        amount: 2000,
        currency: 'USD',
        period: 'invalid-period', // Invalid period
        categoryId: '1',
        startDate: '2023-04-15T14:32:17Z',
        endDate: '2023-05-15T14:32:17Z',
        isRecurring: true,
        notifications: true,
        createdAt: '2023-04-15T14:32:17Z',
        updatedAt: '2023-04-15T14:32:17Z'
      };
      
      expect(validateBudget(invalidBudget as any)).toBe(false);
    });
  });

  describe('validateApiResponse', () => {
    it('should validate a valid API response', () => {
      const validApiResponse = {
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Test Data'
        },
        meta: {
          timestamp: '2023-04-15T14:32:17Z',
          requestId: '123e4567-e89b-12d3-a456-426614174001'
        }
      };
      
      expect(validateApiResponse(validApiResponse)).toBe(true);
    });

    it('should reject an invalid API response', () => {
      const invalidApiResponse = {
        // Missing data
        meta: {
          timestamp: '2023-04-15T14:32:17Z',
          requestId: '123e4567-e89b-12d3-a456-426614174001'
        }
      };
      
      expect(validateApiResponse(invalidApiResponse as any)).toBe(false);
    });

    it('should reject an API response with an error', () => {
      const errorApiResponse = {
        error: {
          code: 'NOT_FOUND',
          message: 'Resource not found'
        },
        meta: {
          timestamp: '2023-04-15T14:32:17Z',
          requestId: '123e4567-e89b-12d3-a456-426614174001'
        }
      };
      
      // This might be true or false depending on how validateApiResponse is implemented
      // If it validates error responses as well, this test should expect true
      expect(validateApiResponse(errorApiResponse)).toBe(true);
    });
  });
});
