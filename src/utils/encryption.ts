/**
 * Encryption utility for sensitive financial data
 * Uses the Web Crypto API for secure encryption/decryption
 */

// Generate a random encryption key
export const generateEncryptionKey = async (): Promise<CryptoKey> => {
  const key = await window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true, // extractable
    ['encrypt', 'decrypt']
  );
  
  return key;
};

// Export key to string format
export const exportKey = async (key: CryptoKey): Promise<string> => {
  const exportedKey = await window.crypto.subtle.exportKey('raw', key);
  const exportedKeyBuffer = new Uint8Array(exportedKey);
  return Array.from(exportedKeyBuffer)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
};

// Import key from string format
export const importKey = async (keyString: string): Promise<CryptoKey> => {
  const keyBytes = new Uint8Array(
    keyString.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
  );
  
  const key = await window.crypto.subtle.importKey(
    'raw',
    keyBytes,
    {
      name: 'AES-GCM',
      length: 256,
    },
    false, // not extractable
    ['encrypt', 'decrypt']
  );
  
  return key;
};

// Generate a random initialization vector (IV)
export const generateIV = (): Uint8Array => {
  return window.crypto.getRandomValues(new Uint8Array(12));
};

interface EncryptedData {
  encryptedData: string;
  iv: string;
}

/**
 * Encrypt data with AES-GCM
 * @param {Object|string} data - Data to encrypt
 * @param {CryptoKey} key - Encryption key
 * @returns {Promise<{encryptedData: string, iv: string}>} - Encrypted data and IV
 */
export const encryptData = async (data: any, key: CryptoKey): Promise<EncryptedData> => {
  try {
    // Prepare data
    const jsonData = typeof data === 'string' ? data : JSON.stringify(data);
    const encodedData = new TextEncoder().encode(jsonData);
    
    // Generate IV
    const iv = generateIV();
    
    // Encrypt
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      encodedData
    );
    
    // Convert to strings
    const encryptedArray = Array.from(new Uint8Array(encryptedBuffer));
    const ivArray = Array.from(iv);
    
    return {
      encryptedData: encryptedArray
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join(''),
      iv: ivArray
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('')
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Decrypt data with AES-GCM
 * @param {string} encryptedData - Encrypted data string
 * @param {string} iv - Initialization vector string
 * @param {CryptoKey} key - Decryption key
 * @returns {Promise<Object|string>} - Decrypted data
 */
export const decryptData = async (encryptedData: string, iv: string, key: CryptoKey): Promise<any> => {
  try {
    // Convert strings back to Uint8Array
    const encryptedBytes = new Uint8Array(
      encryptedData.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
    );
    
    const ivBytes = new Uint8Array(
      iv.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
    );
    
    // Decrypt
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ivBytes,
      },
      key,
      encryptedBytes
    );
    
    // Decode result
    const decryptedText = new TextDecoder().decode(decryptedBuffer);
    
    // Try parsing as JSON
    try {
      return JSON.parse(decryptedText);
    } catch (e) {
      // If not valid JSON, return as string
      return decryptedText;
    }
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};

/**
 * Securely hash sensitive data (one-way)
 * @param {string} data - Data to hash
 * @returns {Promise<string>} - Hashed data
 */
export const hashData = async (data: string): Promise<string> => {
  try {
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);
    
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', encodedData);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    
    return hashArray
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
  } catch (error) {
    console.error('Hash error:', error);
    throw new Error('Failed to hash data');
  }
};

/**
 * Generate a secure user encryption key derived from password
 * @param {string} password - User password
 * @param {string} salt - Salt for PBKDF2
 * @returns {Promise<CryptoKey>} - Derived key
 */
export const deriveKeyFromPassword = async (password: string, salt: string): Promise<CryptoKey> => {
  try {
    // Convert password and salt to proper format
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    const saltBuffer = encoder.encode(salt);
    
    // Import the password as a key
    const passwordKey = await window.crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );
    
    // Derive a key using PBKDF2
    const derivedKey = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: saltBuffer,
        iterations: 100000,
        hash: 'SHA-256',
      },
      passwordKey,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
    
    return derivedKey;
  } catch (error) {
    console.error('Key derivation error:', error);
    throw new Error('Failed to derive key from password');
  }
};

/**
 * Initialize encryption for a user - generates and securely stores keys
 * @param {string} userId - User ID
 * @param {string} password - User password
 * @returns {Promise<boolean>} - Success/failure
 */
export const initializeUserEncryption = async (userId: string, password: string): Promise<boolean> => {
  try {
    // Generate a random salt
    const saltArray = window.crypto.getRandomValues(new Uint8Array(16));
    const salt = Array.from(saltArray)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
    
    // Derive a key from the password
    const derivedKey = await deriveKeyFromPassword(password, salt);
    
    // Generate a random master key for the user's data
    const masterKey = await generateEncryptionKey();
    const exportedMasterKey = await exportKey(masterKey);
    
    // Encrypt the master key with the derived key
    const { encryptedData, iv } = await encryptData(exportedMasterKey, derivedKey);
    
    // Store the encrypted master key and salt in localStorage
    localStorage.setItem(`user_${userId}_encrypted_key`, encryptedData);
    localStorage.setItem(`user_${userId}_key_iv`, iv);
    localStorage.setItem(`user_${userId}_salt`, salt);
    
    // Also store the current user's key in sessionStorage for use during the session
    sessionStorage.setItem('current_user_key', exportedMasterKey);
    
    return true;
  } catch (error) {
    console.error('Encryption initialization error:', error);
    throw new Error('Failed to initialize encryption');
  }
};

/**
 * Unlock a user's encryption using their password
 * @param {string} userId - User ID
 * @param {string} password - User password
 * @returns {Promise<boolean>} - Success/failure
 */
export const unlockUserEncryption = async (userId: string, password: string): Promise<boolean> => {
  try {
    // Get stored values
    const encryptedKey = localStorage.getItem(`user_${userId}_encrypted_key`);
    const iv = localStorage.getItem(`user_${userId}_key_iv`);
    const salt = localStorage.getItem(`user_${userId}_salt`);
    
    if (!encryptedKey || !iv || !salt) {
      throw new Error('Encryption not initialized for user');
    }
    
    // Derive the key from the password
    const derivedKey = await deriveKeyFromPassword(password, salt);
    
    // Decrypt the master key
    const decryptedKey = await decryptData(encryptedKey, iv, derivedKey);
    
    // Store the decrypted key in session storage
    sessionStorage.setItem('current_user_key', decryptedKey);
    
    return true;
  } catch (error) {
    console.error('Failed to unlock encryption:', error);
    return false;
  }
};

interface EncryptedObject extends EncryptedData {
  timestamp: number;
}

/**
 * Encrypt financial data using the current session key
 * @param {Object} data - Data to encrypt
 * @returns {Promise<EncryptedObject>} - Encrypted data object
 */
export const encryptFinancialData = async (data: any): Promise<EncryptedObject> => {
  try {
    const keyString = sessionStorage.getItem('current_user_key');
    if (!keyString) {
      throw new Error('No encryption key available');
    }
    
    const key = await importKey(keyString);
    const encrypted = await encryptData(data, key);
    
    return {
      ...encrypted,
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('Failed to encrypt financial data:', error);
    throw new Error('Failed to encrypt financial data');
  }
};

/**
 * Decrypt financial data using the current session key
 * @param {EncryptedObject} encryptedObject - Encrypted data object
 * @returns {Promise<any>} - Decrypted data
 */
export const decryptFinancialData = async (encryptedObject: EncryptedObject): Promise<any> => {
  try {
    const keyString = sessionStorage.getItem('current_user_key');
    if (!keyString) {
      throw new Error('No encryption key available');
    }
    
    const key = await importKey(keyString);
    const decrypted = await decryptData(
      encryptedObject.encryptedData,
      encryptedObject.iv,
      key
    );
    
    return decrypted;
  } catch (error) {
    console.error('Failed to decrypt financial data:', error);
    throw new Error('Failed to decrypt financial data');
  }
};

/**
 * Change a user's encryption password
 * @param {string} userId - User ID
 * @param {string} oldPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<boolean>} - Success/failure
 */
export const changeEncryptionPassword = async (
  userId: string,
  oldPassword: string,
  newPassword: string
): Promise<boolean> => {
  try {
    // First verify the old password works
    const unlocked = await unlockUserEncryption(userId, oldPassword);
    if (!unlocked) {
      throw new Error('Invalid old password');
    }
    
    // Get the current master key
    const masterKey = sessionStorage.getItem('current_user_key');
    if (!masterKey) {
      throw new Error('No encryption key available');
    }
    
    // Generate a new salt
    const saltArray = window.crypto.getRandomValues(new Uint8Array(16));
    const salt = Array.from(saltArray)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
    
    // Derive a new key from the new password
    const newDerivedKey = await deriveKeyFromPassword(newPassword, salt);
    
    // Encrypt the master key with the new derived key
    const { encryptedData, iv } = await encryptData(masterKey, newDerivedKey);
    
    // Update storage
    localStorage.setItem(`user_${userId}_encrypted_key`, encryptedData);
    localStorage.setItem(`user_${userId}_key_iv`, iv);
    localStorage.setItem(`user_${userId}_salt`, salt);
    
    return true;
  } catch (error) {
    console.error('Failed to change encryption password:', error);
    return false;
  }
};

/**
 * Check if the Web Crypto API is supported
 * @returns {boolean} - Whether crypto is supported
 */
export const isCryptoSupported = (): boolean => {
  return !!(window.crypto && window.crypto.subtle);
}; 