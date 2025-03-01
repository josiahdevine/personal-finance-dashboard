/**
 * Server-side encryption utilities for sensitive data
 * Uses Node.js crypto module for encryption/decryption
 */

const crypto = require('crypto');

// Algorithm configuration
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 64;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;

/**
 * Generate a secure encryption key from a master key and salt
 * @param {string} masterKey - Master encryption key from environment
 * @param {Buffer} salt - Salt for key derivation
 * @returns {Buffer} Derived key
 */
function deriveKey(masterKey, salt) {
  return crypto.pbkdf2Sync(
    masterKey,
    salt,
    ITERATIONS,
    KEY_LENGTH,
    'sha256'
  );
}

/**
 * Encrypt sensitive data
 * @param {string} data - Data to encrypt
 * @param {string} masterKey - Master encryption key from environment
 * @returns {string} Encrypted data in format: salt:iv:authTag:encryptedData
 */
function encrypt(data, masterKey) {
  try {
    // Generate salt and derive key
    const salt = crypto.randomBytes(SALT_LENGTH);
    const key = deriveKey(masterKey, salt);

    // Generate IV
    const iv = crypto.randomBytes(IV_LENGTH);

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    // Encrypt data
    let encryptedData = cipher.update(data, 'utf8', 'hex');
    encryptedData += cipher.final('hex');

    // Get auth tag
    const authTag = cipher.getAuthTag();

    // Combine all components
    return Buffer.concat([
      salt,
      iv,
      authTag,
      Buffer.from(encryptedData, 'hex')
    ]).toString('base64');
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt sensitive data
 * @param {string} encryptedData - Data to decrypt (format: salt:iv:authTag:encryptedData)
 * @param {string} masterKey - Master encryption key from environment
 * @returns {string} Decrypted data
 */
function decrypt(encryptedData, masterKey) {
  try {
    // Convert from base64 to buffer
    const buffer = Buffer.from(encryptedData, 'base64');

    // Extract components
    const salt = buffer.slice(0, SALT_LENGTH);
    const iv = buffer.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const authTag = buffer.slice(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);
    const data = buffer.slice(SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);

    // Derive key
    const key = deriveKey(masterKey, salt);

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    // Decrypt data
    let decrypted = decipher.update(data, null, 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Hash sensitive data (one-way)
 * @param {string} data - Data to hash
 * @returns {string} Hashed data
 */
function hash(data) {
  return crypto
    .createHash('sha256')
    .update(data)
    .digest('hex');
}

module.exports = {
  encrypt,
  decrypt,
  hash
}; 