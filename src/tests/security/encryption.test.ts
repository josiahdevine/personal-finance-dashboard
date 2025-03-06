import { encryptPortfolioFields, decryptPortfolioFields } from '../../utils/portfolioEncryption';
import { KeyRotationManager } from '../../utils/keyRotation';

interface EncryptedField<T> {
  data: string;
  iv: string;
  isEncrypted: boolean;
  _type: T;
}

interface EncryptedData {
  accountNumber: EncryptedField<string>;
  routingNumber: EncryptedField<string>;
  balance: EncryptedField<number>;
  transactions: EncryptedField<Array<{ id: number; amount: number }>>;
  positions: EncryptedField<Array<{ id: number; quantity: number; price: number }>>;
  nonSensitiveField: string;
}

describe('Portfolio Encryption System', () => {
  const testData = {
    accountNumber: '1234567890',
    routingNumber: '987654321',
    balance: 1000.50,
    transactions: [
      { id: 1, amount: 100 }
    ],
    positions: [
      { id: 1, quantity: 10, price: 50 }
    ],
    nonSensitiveField: 'public data'
  };

  beforeEach(async () => {
    // Initialize key rotation system
    await KeyRotationManager.initialize();
  });

  describe('Field-Level Encryption', () => {
    test('should encrypt sensitive fields only', async () => {
      const encrypted = await encryptPortfolioFields(testData) as EncryptedData;
      
      // Check sensitive fields are encrypted
      expect(encrypted.accountNumber.isEncrypted).toBe(true);
      expect(encrypted.routingNumber.isEncrypted).toBe(true);
      expect(encrypted.balance.isEncrypted).toBe(true);
      expect(encrypted.transactions.isEncrypted).toBe(true);
      expect(encrypted.positions.isEncrypted).toBe(true);
      
      // Check non-sensitive fields remain unchanged
      expect(encrypted.nonSensitiveField).toBe(testData.nonSensitiveField);
    });

    test('should maintain data types after encryption/decryption', async () => {
      const encrypted = await encryptPortfolioFields(testData);
      const decrypted = await decryptPortfolioFields(encrypted);
      
      expect(typeof decrypted.balance).toBe('number');
      expect(Array.isArray(decrypted.transactions)).toBe(true);
      expect(Array.isArray(decrypted.positions)).toBe(true);
    });

    test('should handle null and undefined values', async () => {
      const dataWithNulls = {
        accountNumber: null,
        balance: undefined,
        transactions: []
      };
      
      const encrypted = await encryptPortfolioFields(dataWithNulls);
      const decrypted = await decryptPortfolioFields(encrypted);
      
      expect(decrypted.accountNumber).toBeNull();
      expect(decrypted.balance).toBeUndefined();
      expect(decrypted.transactions).toEqual([]);
    });

    test('should handle large datasets', async () => {
      const largeData = {
        transactions: Array(1000).fill(null).map((_, i) => ({
          id: i,
          amount: Math.random() * 1000
        }))
      };
      
      const encrypted = await encryptPortfolioFields(largeData);
      const decrypted = await decryptPortfolioFields(encrypted);
      
      expect(decrypted.transactions.length).toBe(1000);
    });
  });

  describe('Error Handling', () => {
    test('should handle encryption failures gracefully', async () => {
      // Mock encryption failure
      const invalidData = Symbol('invalid');
      const result = await encryptPortfolioFields({ balance: invalidData as any });
      
      expect(result.balance).toBe(invalidData);
    });

    test('should handle decryption failures gracefully', async () => {
      const encrypted = await encryptPortfolioFields(testData) as EncryptedData;
      encrypted.balance.data = 'corrupted-data';
      
      const decrypted = await decryptPortfolioFields(encrypted);
      expect(decrypted.balance).toEqual(encrypted.balance);
    });
  });

  describe('Performance', () => {
    test('should encrypt/decrypt quickly for normal operations', async () => {
      const start = Date.now();
      
      const encrypted = await encryptPortfolioFields(testData);
      await decryptPortfolioFields(encrypted); // Used but not stored
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(100); // Should complete within 100ms
    });

    test('should handle concurrent operations', async () => {
      const operations = Array(10).fill(null).map(() => 
        encryptPortfolioFields(testData)
      );
      
      const results = await Promise.all(operations);
      expect(results).toHaveLength(10);
    });
  });
}); 