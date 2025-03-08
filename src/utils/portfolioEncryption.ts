import { encryptData, decryptData, isCryptoSupported } from './encryption';

interface EncryptedField {
  data: string;
  iv: string;
  isEncrypted: boolean;
  _type: string;  // Type information for TypeScript, not stored
}

/**
 * Fields that should be encrypted in portfolio data
 */
const SENSITIVE_FIELDS = [
  'accountNumber',
  'routingNumber',
  'balance',
  'transactions',
  'positions'
] as const;

type SensitiveField = typeof SENSITIVE_FIELDS[number];

/**
 * Encrypts specific fields in portfolio data
 */
export async function encryptPortfolioFields(
  data: Record<string, any>,
  fieldsToEncrypt: SensitiveField[] = [...SENSITIVE_FIELDS]
): Promise<Record<string, any>> {
  if (!isCryptoSupported()) {
    console.warn('Crypto API not supported - data will not be encrypted');
    return data;
  }

  const encryptedData: Record<string, any> = { ...data };

  for (const field of fieldsToEncrypt) {
    if (field in data && data[field] !== null) {
      try {
        // Get current encryption key from your key management system
        const currentKey = await getCurrentEncryptionKey();
        const encrypted = await encryptData(data[field], currentKey);
        encryptedData[field] = {
          ...encrypted,
          isEncrypted: true,
          _type: typeof data[field]
        };
      } catch (error) {
        console.error(`Failed to encrypt field ${field}:`, error);
        // Keep original data if encryption fails
        encryptedData[field] = data[field];
      }
    }
  }

  return encryptedData;
}

/**
 * Placeholder function to get current encryption key
 * Replace with your actual key management implementation
 */
async function getCurrentEncryptionKey(): Promise<CryptoKey> {
  // This is a placeholder - in a real app, you'd retrieve the stored encryption key
  throw new Error('getCurrentEncryptionKey not implemented');
}

/**
 * Decrypts specific fields in portfolio data
 */
export async function decryptPortfolioFields(
  data: Record<string, any>,
  fieldsToDecrypt: SensitiveField[] = [...SENSITIVE_FIELDS]
): Promise<Record<string, any>> {
  if (!isCryptoSupported()) {
    return data;
  }

  const decryptedData: Record<string, any> = { ...data };

  for (const field of fieldsToDecrypt) {
    if (field in data && data[field] !== null) {
      const encryptedField = data[field] as EncryptedField;
      
      if (encryptedField.isEncrypted) {
        try {
          // Get current encryption key from your key management system
          const currentKey = await getCurrentEncryptionKey();
          const decrypted = await decryptData(
            encryptedField.data,
            encryptedField.iv,
            currentKey
          );
          
          // Convert back to original type
          decryptedData[field] = 
            encryptedField._type === 'number' ? Number(decrypted) :
            encryptedField._type === 'boolean' ? Boolean(decrypted) :
            decrypted;
        } catch (error) {
          console.error(`Failed to decrypt field ${field}:`, error);
          // Keep encrypted data if decryption fails
          decryptedData[field] = data[field];
        }
      }
    }
  }

  return decryptedData;
}

/**
 * Checks if a field in portfolio data is encrypted
 */
export function isFieldEncrypted(
  data: any,
  field: string
): boolean {
  return (
    data &&
    typeof data === 'object' &&
    field in data &&
    data[field] !== null &&
    typeof data[field] === 'object' &&
    'isEncrypted' in data[field] &&
    data[field].isEncrypted === true
  );
}

/**
 * Gets a list of all encrypted fields in the data
 */
export function getEncryptedFields(
  data: Record<string, any>
): string[] {
  return Object.keys(data).filter(field => isFieldEncrypted(data, field));
} 