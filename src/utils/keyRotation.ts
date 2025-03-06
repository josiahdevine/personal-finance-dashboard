import {
  generateEncryptionKey,
  exportKey,
  importKey,
  encryptData,
  decryptData
} from './encryption';

interface KeyVersion {
  version: number;
  key: string;
  createdAt: string;
  expiresAt: string;
}

/**
 * Manages encryption key rotation
 */
export class KeyRotationManager {
  private static readonly KEY_VERSION_PREFIX = 'encryption_key_v';
  private static readonly CURRENT_VERSION_KEY = 'current_key_version';
  private static readonly KEY_ROTATION_INTERVAL = 30 * 24 * 60 * 60 * 1000; // 30 days

  /**
   * Initialize key rotation system
   */
  static async initialize(): Promise<void> {
    const currentVersion = this.getCurrentKeyVersion();
    if (!currentVersion) {
      await this.rotateKey();
    }
  }

  /**
   * Get the current key version
   */
  static getCurrentKeyVersion(): number {
    const version = localStorage.getItem(this.CURRENT_VERSION_KEY);
    return version ? parseInt(version, 10) : 0;
  }

  /**
   * Get a specific key version
   */
  static async getKeyVersion(version: number): Promise<KeyVersion | null> {
    const keyData = localStorage.getItem(`${this.KEY_VERSION_PREFIX}${version}`);
    if (!keyData) {
      return null;
    }
    return JSON.parse(keyData);
  }

  /**
   * Get the current active key
   */
  static async getCurrentKey(): Promise<string> {
    const version = this.getCurrentKeyVersion();
    const keyVersion = await this.getKeyVersion(version);
    if (!keyVersion) {
      throw new Error('Current key version not found');
    }
    return keyVersion.key;
  }

  /**
   * Rotate to a new encryption key
   */
  static async rotateKey(): Promise<void> {
    const currentVersion = this.getCurrentKeyVersion();
    const newVersion = currentVersion + 1;

    // Generate new key
    const newKey = await generateEncryptionKey();
    const exportedKey = await exportKey(newKey);

    // Store new key version
    const keyVersion: KeyVersion = {
      version: newVersion,
      key: exportedKey,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + this.KEY_ROTATION_INTERVAL).toISOString()
    };

    localStorage.setItem(
      `${this.KEY_VERSION_PREFIX}${newVersion}`,
      JSON.stringify(keyVersion)
    );
    localStorage.setItem(this.CURRENT_VERSION_KEY, newVersion.toString());

    // Schedule next rotation
    this.scheduleNextRotation();
  }

  /**
   * Schedule the next key rotation
   */
  private static scheduleNextRotation(): void {
    setTimeout(
      () => this.rotateKey(),
      this.KEY_ROTATION_INTERVAL
    );
  }

  /**
   * Check if key rotation is needed
   */
  static async checkRotation(): Promise<boolean> {
    const currentVersion = this.getCurrentKeyVersion();
    const keyVersion = await this.getKeyVersion(currentVersion);
    
    if (!keyVersion) {
      return true;
    }

    const expiresAt = new Date(keyVersion.expiresAt);
    return Date.now() >= expiresAt.getTime();
  }

  /**
   * Re-encrypt data with the current key
   */
  static async reencryptData<T extends Record<string, any>>(
    data: T,
    oldKey: string
  ): Promise<T> {
    const oldKeyObj = await importKey(oldKey);
    const currentKey = await this.getCurrentKey();
    const currentKeyObj = await importKey(currentKey);

    // Re-encrypt each encrypted field
    const reencrypted = { ...data };
    for (const key in data) {
      if (typeof data[key] === 'object' && data[key]?.isEncrypted) {
        const decrypted = await decryptData(data[key].data, data[key].iv, oldKeyObj);
        const encrypted = await encryptData(decrypted, currentKeyObj);
        reencrypted[key] = encrypted;
      }
    }

    return reencrypted;
  }

  /**
   * Clean up old key versions
   */
  static async cleanupOldKeys(retainCount = 2): Promise<void> {
    const currentVersion = this.getCurrentKeyVersion();
    
    // Keep the most recent 'retainCount' versions
    for (let version = 0; version < currentVersion - retainCount; version++) {
      localStorage.removeItem(`${this.KEY_VERSION_PREFIX}${version}`);
    }
  }
} 