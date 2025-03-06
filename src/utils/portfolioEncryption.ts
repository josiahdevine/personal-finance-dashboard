import { encryptData, decryptData, isCryptoSupported } from './encryption';

interface EncryptedField<T> {
  data: string;
  iv: string;
  isEncrypted: boolean;
  _type: T;  // Type information for TypeScript, not stored
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
export async function encryptPortfolioFields<T extends Record<string, any>>(
  data: T,
  fieldsToEncrypt: SensitiveField[] = [...SENSITIVE_FIELDS]
): Promise<T> {
  if (!isCryptoSupported()) {
    console.warn('Crypto API not supported - data will not be encrypted');
    return data;
  }

  const encryptedData = { ...data };

  for (const field of fieldsToEncrypt) {
    if (field in data && data[field] !== null) {
      try {
        const encrypted = await encryptData(data[field]);
        encryptedData[field] = {
          ...encrypted,
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
 * Decrypts specific fields in portfolio data
 */
export async function decryptPortfolioFields<T extends Record<string, any>>(
  data: T,
  fieldsToDecrypt: SensitiveField[] = [...SENSITIVE_FIELDS]
): Promise<T> {
  if (!isCryptoSupported()) {
    return data;
  }

  const decryptedData = { ...data };

  for (const field of fieldsToDecrypt) {
    if (field in data && data[field] !== null) {
      const encryptedField = data[field] as EncryptedField<any>;
      
      if (encryptedField.isEncrypted) {
        try {
          const decrypted = await decryptData(
            encryptedField.data,
            encryptedField.iv
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