import { encryptPortfolioData, decryptPortfolioData } from '../../utils/portfolioEncryption';
import { KeyRotationManager } from '../../utils/keyRotation';

interface EncryptedData {
  data: string;
  keyId: number;
  version: number;
  timestamp: string;
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

  describe('Portfolio Data Encryption', () => {
    test('should encrypt and decrypt portfolio data correctly', async () => {
      const encrypted = encryptPortfolioData(testData);
      
      // Encrypted data should be a string
      expect(typeof encrypted).toBe('string');
      
      // Should be valid JSON
      const encryptedObj = JSON.parse(encrypted) as EncryptedData;
      expect(encryptedObj.data).toBeDefined();
      expect(encryptedObj.keyId).toBeDefined();
      expect(encryptedObj.version).toBeDefined();
      expect(encryptedObj.timestamp).toBeDefined();
      
      // Decrypt and check if data is intact
      const decrypted = decryptPortfolioData(encrypted);
      expect(decrypted.accountNumber).toBe(testData.accountNumber);
      expect(decrypted.routingNumber).toBe(testData.routingNumber);
      expect(decrypted.balance).toBe(testData.balance);
      expect(JSON.stringify(decrypted.transactions)).toBe(JSON.stringify(testData.transactions));
      expect(JSON.stringify(decrypted.positions)).toBe(JSON.stringify(testData.positions));
      expect(decrypted.nonSensitiveField).toBe(testData.nonSensitiveField);
    });

    test('should maintain data types after encryption/decryption', async () => {
      const encrypted = encryptPortfolioData(testData);
      const decrypted = decryptPortfolioData(encrypted);
      
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
      
      const encrypted = encryptPortfolioData(dataWithNulls);
      const decrypted = decryptPortfolioData(encrypted);
      
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
      
      const encrypted = encryptPortfolioData(largeData);
      const decrypted = decryptPortfolioData(encrypted);
      
      expect(decrypted.transactions.length).toBe(1000);
    });
  });

  describe('Error Handling', () => {
    test('should throw error for invalid encrypted data', async () => {
      const invalidEncryptedData = 'not-valid-encrypted-data';
      
      expect(() => {
        decryptPortfolioData(invalidEncryptedData);
      }).toThrow();
    });
  });

  describe('Performance', () => {
    test('should encrypt/decrypt quickly for normal operations', async () => {
      const start = Date.now();
      
      const encrypted = encryptPortfolioData(testData);
      decryptPortfolioData(encrypted); // Used but not stored
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(500); // Should complete within 500ms
    });

    test('should handle concurrent operations', async () => {
      const operations = Array(10).fill(null).map(() => 
        encryptPortfolioData(testData)
      );
      
      expect(operations).toHaveLength(10);
      operations.forEach(encrypted => {
        const decrypted = decryptPortfolioData(encrypted);
        expect(decrypted.accountNumber).toBe(testData.accountNumber);
      });
    });
  });
}); 