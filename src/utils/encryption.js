/**
 * Encryption utility for sensitive financial data
 * Uses the Web Crypto API for secure encryption/decryption
 */

// Generate a random encryption key
const generateEncryptionKey = async () => {
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
const exportKey = async (key) => {
  const exportedKey = await window.crypto.subtle.exportKey('raw', key);
  const exportedKeyBuffer = new Uint8Array(exportedKey);
  return Array.from(exportedKeyBuffer)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
};

// Import key from string format
const importKey = async (keyString) => {
  const keyBytes = new Uint8Array(
    keyString.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
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
const generateIV = () => {
  return window.crypto.getRandomValues(new Uint8Array(12));
};

/**
 * Encrypt data with AES-GCM
 * @param {Object|string} data - Data to encrypt
 * @param {CryptoKey} key - Encryption key
 * @returns {Promise<{encryptedData: string, iv: string}>} - Encrypted data and IV
 */
export const encryptData = async (data, key) => {
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
export const decryptData = async (encryptedData, iv, key) => {
  try {
    // Convert strings back to Uint8Array
    const encryptedBytes = new Uint8Array(
      encryptedData.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
    );
    
    const ivBytes = new Uint8Array(
      iv.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
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
export const hashData = async (data) => {
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
export const deriveKeyFromPassword = async (password, salt) => {
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
 * @returns {Promise<void>}
 */
export const initializeUserEncryption = async (userId, password) => {
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
export const unlockUserEncryption = async (userId, password) => {
  try {
    // Retrieve the salt, encrypted master key, and IV
    const salt = localStorage.getItem(`user_${userId}_salt`);
    const encryptedMasterKey = localStorage.getItem(`user_${userId}_encrypted_key`);
    const iv = localStorage.getItem(`user_${userId}_key_iv`);
    
    if (!salt || !encryptedMasterKey || !iv) {
      throw new Error('Encryption data not found');
    }
    
    // Derive the key from the password
    const derivedKey = await deriveKeyFromPassword(password, salt);
    
    // Decrypt the master key
    const exportedMasterKey = await decryptData(encryptedMasterKey, iv, derivedKey);
    
    // Store in session storage for the current session
    sessionStorage.setItem('current_user_key', exportedMasterKey);
    
    return true;
  } catch (error) {
    console.error('Failed to unlock encryption:', error);
    return false;
  }
};

/**
 * Encrypt financial data for storage
 * @param {Object} data - Financial data to encrypt
 * @returns {Promise<Object>} - Encrypted data object
 */
export const encryptFinancialData = async (data) => {
  try {
    // Get the current user's key from session storage
    const exportedKey = sessionStorage.getItem('current_user_key');
    
    if (!exportedKey) {
      throw new Error('Encryption key not found');
    }
    
    // Import the key
    const key = await importKey(exportedKey);
    
    // Encrypt the data
    const { encryptedData, iv } = await encryptData(data, key);
    
    return {
      data: encryptedData,
      iv,
      isEncrypted: true
    };
  } catch (error) {
    console.error('Failed to encrypt financial data:', error);
    // Fallback to storing unencrypted data
    return {
      data,
      isEncrypted: false
    };
  }
};

/**
 * Decrypt financial data
 * @param {Object} encryptedObject - Encrypted data object
 * @returns {Promise<Object>} - Decrypted data
 */
export const decryptFinancialData = async (encryptedObject) => {
  try {
    // If data is not encrypted, return as is
    if (!encryptedObject.isEncrypted) {
      return encryptedObject.data;
    }
    
    // Get the current user's key from session storage
    const exportedKey = sessionStorage.getItem('current_user_key');
    
    if (!exportedKey) {
      throw new Error('Encryption key not found');
    }
    
    // Import the key
    const key = await importKey(exportedKey);
    
    // Decrypt the data
    const decryptedData = await decryptData(
      encryptedObject.data,
      encryptedObject.iv,
      key
    );
    
    return decryptedData;
  } catch (error) {
    console.error('Failed to decrypt financial data:', error);
    throw new Error('Unable to decrypt data');
  }
};

/**
 * Change encryption password
 * @param {string} userId - User ID
 * @param {string} oldPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<boolean>} - Success/failure
 */
export const changeEncryptionPassword = async (userId, oldPassword, newPassword) => {
  try {
    // First unlock with the old password
    const unlocked = await unlockUserEncryption(userId, oldPassword);
    
    if (!unlocked) {
      throw new Error('Current password is incorrect');
    }
    
    // Get the master key from session storage
    const masterKeyString = sessionStorage.getItem('current_user_key');
    
    if (!masterKeyString) {
      throw new Error('Master key not found');
    }
    
    // Generate a new salt
    const saltArray = window.crypto.getRandomValues(new Uint8Array(16));
    const salt = Array.from(saltArray)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
    
    // Derive a new key from the new password
    const newDerivedKey = await deriveKeyFromPassword(newPassword, salt);
    
    // Encrypt the master key with the new derived key
    const { encryptedData, iv } = await encryptData(masterKeyString, newDerivedKey);
    
    // Update localStorage
    localStorage.setItem(`user_${userId}_encrypted_key`, encryptedData);
    localStorage.setItem(`user_${userId}_key_iv`, iv);
    localStorage.setItem(`user_${userId}_salt`, salt);
    
    return true;
  } catch (error) {
    console.error('Password change error:', error);
    return false;
  }
};

// Check if the browser supports the required crypto API
export const isCryptoSupported = () => {
  return !!(
    window.crypto &&
    window.crypto.subtle &&
    window.crypto.getRandomValues
  );
}; 