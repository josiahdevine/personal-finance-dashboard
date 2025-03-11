import CryptoJS from 'crypto-js';
import logger from './logger';

// Mock key rotation service for now
// This would typically be a more complex implementation that manages key rotation
const keyRotationService = {
  getCurrentKeyId: (): number => 1,
  getCurrentKey: (): string => {
    const key = process.env.REACT_APP_ENCRYPTION_KEY || 'default-encryption-key-for-development';
    return key;
  },
  getKeyById: (keyId: number): string | null => {
    if (keyId === 1) {
      return process.env.REACT_APP_ENCRYPTION_KEY || 'default-encryption-key-for-development';
    }
    return null;
  }
};

export const getKeyRotationService = () => keyRotationService;

/**
 * Encrypts portfolio data using the current encryption key
 */
export function encryptPortfolioData(data: any): string {
  try {
    const key = getCurrentEncryptionKey();
    const jsonString = JSON.stringify(data);
    
    // Encrypt the data
    const encryptedData = CryptoJS.AES.encrypt(jsonString, key).toString();
    
    // Return encrypted data with metadata
    return JSON.stringify({
      version: 1,
      keyId: getKeyRotationService().getCurrentKeyId(),
      data: encryptedData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown encryption error');
    logger.error('PortfolioEncryption', 'Error encrypting portfolio data:', err);
    throw new Error('Failed to encrypt portfolio data');
  }
}

/**
 * Decrypts portfolio data
 */
export function decryptPortfolioData(encryptedString: string): any {
  try {
    // Parse the encrypted package
    const encryptedPackage = JSON.parse(encryptedString);
    
    // Get the key for this data version
    const key = getKeyById(encryptedPackage.keyId);
    
    if (!key) {
      throw new Error(`Encryption key not found for key ID: ${encryptedPackage.keyId}`);
    }
    
    // Decrypt the data
    const decryptedBytes = CryptoJS.AES.decrypt(encryptedPackage.data, key);
    const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedText) {
      throw new Error('Decryption failed: Invalid result');
    }
    
    // Parse the JSON data
    return JSON.parse(decryptedText);
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown decryption error');
    logger.error('PortfolioEncryption', 'Error decrypting portfolio data:', err);
    throw new Error('Failed to decrypt portfolio data');
  }
}

/**
 * Gets the current encryption key
 */
export function getCurrentEncryptionKey(): string {
  const keyService = getKeyRotationService();
  const currentKey = keyService.getCurrentKey();
  
  if (!currentKey) {
    throw new Error('Current encryption key not available');
  }
  
  return currentKey;
}

/**
 * Gets an encryption key by ID
 */
export function getKeyById(keyId: number): string | null {
  return getKeyRotationService().getKeyById(keyId);
}

/**
 * Re-encrypts data with the current key
 */
export function reencryptPortfolioData(encryptedString: string): string {
  const data = decryptPortfolioData(encryptedString);
  return encryptPortfolioData(data);
}

/**
 * Checks if data needs re-encryption with a newer key
 */
export function needsReencryption(encryptedString: string): boolean {
  try {
    const encryptedPackage = JSON.parse(encryptedString);
    const currentKeyId = getKeyRotationService().getCurrentKeyId();
    
    // Re-encrypt if using an older key version
    return encryptedPackage.keyId < currentKeyId;
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown error checking encryption');
    logger.error('PortfolioEncryption', 'Error checking if reencryption is needed:', err);
    return true; // Be safe and suggest reencryption if we can't determine
  }
}

/**
 * Initialize portfolio encryption system
 */
export async function initializePortfolioEncryption(): Promise<void> {
  try {
    // Check if encryption keys are available
    const currentKey = getKeyRotationService().getCurrentKey();
    
    if (!currentKey) {
      throw new Error('Encryption key not available');
    }
    
    logger.info('PortfolioEncryption', 'Portfolio encryption initialized successfully');
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown initialization error');
    logger.error('PortfolioEncryption', 'Failed to initialize portfolio encryption:', err);
    throw new Error('Failed to initialize portfolio encryption');
  }
} 