import { KeyRotationManager } from '../../utils/keyRotation';

describe('Key Rotation System', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('Key Management', () => {
    test('should initialize with a new key', async () => {
      await KeyRotationManager.initialize();
      const version = KeyRotationManager.getCurrentKeyVersion();
      const key = await KeyRotationManager.getCurrentKey();
      
      expect(version).toBe(1);
      expect(key).toBeTruthy();
    });

    test('should rotate keys successfully', async () => {
      await KeyRotationManager.initialize();
      const initialKey = await KeyRotationManager.getCurrentKey();
      const initialVersion = KeyRotationManager.getCurrentKeyVersion();
      
      await KeyRotationManager.rotateKey();
      
      const newKey = await KeyRotationManager.getCurrentKey();
      const newVersion = KeyRotationManager.getCurrentKeyVersion();
      
      expect(newVersion).toBe(initialVersion + 1);
      expect(newKey).not.toBe(initialKey);
    });

    test('should maintain key history', async () => {
      await KeyRotationManager.initialize();
      await KeyRotationManager.rotateKey();
      await KeyRotationManager.rotateKey();
      
      const version1 = await KeyRotationManager.getKeyVersion(1);
      const version2 = await KeyRotationManager.getKeyVersion(2);
      const version3 = await KeyRotationManager.getKeyVersion(3);
      
      // Verify all versions exist
      expect(version1).toBeTruthy();
      expect(version2).toBeTruthy();
      expect(version3).toBeTruthy();

      // TypeScript will now know these are non-null due to the assertions above
      expect(version1!.key).not.toBe(version2!.key);
      expect(version2!.key).not.toBe(version3!.key);
    });

    test('should handle key cleanup', async () => {
      await KeyRotationManager.initialize();
      
      // Create several key versions
      await KeyRotationManager.rotateKey();
      await KeyRotationManager.rotateKey();
      await KeyRotationManager.rotateKey();
      await KeyRotationManager.rotateKey();
      
      // Clean up old keys
      await KeyRotationManager.cleanupOldKeys(2);
      
      // Check that only recent keys are retained
      const currentVersion = KeyRotationManager.getCurrentKeyVersion();
      const oldVersion = await KeyRotationManager.getKeyVersion(currentVersion - 3);
      const recentVersion = await KeyRotationManager.getKeyVersion(currentVersion - 1);
      
      expect(oldVersion).toBeNull();
      expect(recentVersion).toBeTruthy();
    });
  });

  describe('Key Rotation Schedule', () => {
    test('should detect when rotation is needed', async () => {
      await KeyRotationManager.initialize();
      
      // Mock date to be after rotation interval
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 31); // 31 days in future
      jest.spyOn(Date, 'now').mockImplementation(() => futureDate.getTime());
      
      const needsRotation = await KeyRotationManager.checkRotation();
      expect(needsRotation).toBe(true);
      
      jest.restoreAllMocks();
    });

    test('should not require rotation for new keys', async () => {
      await KeyRotationManager.initialize();
      const needsRotation = await KeyRotationManager.checkRotation();
      expect(needsRotation).toBe(false);
    });
  });

  describe('Data Re-encryption', () => {
    test('should re-encrypt data with new key', async () => {
      await KeyRotationManager.initialize();
      const oldKey = await KeyRotationManager.getCurrentKey();
      
      // Create test data
      const testData = {
        sensitive: {
          data: 'encrypted-data',
          iv: 'test-iv',
          isEncrypted: true
        },
        normal: 'unencrypted-data'
      };
      
      // Rotate key
      await KeyRotationManager.rotateKey();
      
      // Re-encrypt with new key
      const reencrypted = await KeyRotationManager.reencryptData(testData, oldKey);
      
      expect(reencrypted.sensitive.data).not.toBe(testData.sensitive.data);
      expect(reencrypted.normal).toBe(testData.normal);
    });

    test('should handle re-encryption failures gracefully', async () => {
      await KeyRotationManager.initialize();
      const oldKey = await KeyRotationManager.getCurrentKey();
      
      const invalidData = {
        sensitive: {
          data: 'corrupted-data',
          iv: 'invalid-iv',
          isEncrypted: true
        }
      };
      
      await expect(
        KeyRotationManager.reencryptData(invalidData, oldKey)
      ).rejects.toThrow();
    });
  });

  describe('Error Handling', () => {
    test('should handle missing keys', async () => {
      await expect(KeyRotationManager.getCurrentKey()).rejects.toThrow();
    });

    test('should handle invalid key versions', async () => {
      await KeyRotationManager.initialize();
      const invalidVersion = await KeyRotationManager.getKeyVersion(999);
      expect(invalidVersion).toBeNull();
    });

    test('should handle concurrent rotations', async () => {
      await KeyRotationManager.initialize();
      
      const rotations = Array(5).fill(null).map(() => 
        KeyRotationManager.rotateKey()
      );
      
      await Promise.all(rotations);
      
      const finalVersion = KeyRotationManager.getCurrentKeyVersion();
      expect(finalVersion).toBe(6); // Initial + 5 rotations
    });
  });

  describe('Performance', () => {
    test('should complete key operations quickly', async () => {
      const start = Date.now();
      
      await KeyRotationManager.initialize();
      await KeyRotationManager.rotateKey();
      await KeyRotationManager.getCurrentKey();
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(100); // Should complete within 100ms
    });

    test('should handle multiple key versions efficiently', async () => {
      await KeyRotationManager.initialize();
      
      const start = Date.now();
      
      for (let i = 0; i < 10; i++) {
        await KeyRotationManager.rotateKey();
      }
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000); // Should complete within 1s
    });
  });
}); 