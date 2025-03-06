import { KeyRotationManager } from '../../src/utils/keyRotation';
import { encryptPortfolioFields, decryptPortfolioFields } from '../../src/utils/portfolioEncryption';
import { isCryptoSupported } from '../../src/utils/encryption';

interface VerificationResult {
  name: string;
  status: 'success' | 'failure';
  error?: string;
}

async function verifyEncryption(): Promise<VerificationResult> {
  try {
    if (!isCryptoSupported()) {
      return {
        name: 'Encryption Support',
        status: 'failure',
        error: 'Web Crypto API not supported in this environment'
      };
    }

    // Test data
    const testData = {
      accountNumber: '1234567890',
      balance: 1000.50,
      transactions: [
        { id: 1, amount: 100 }
      ]
    };

    // Test encryption
    const encrypted = await encryptPortfolioFields(testData);
    
    // Verify fields are encrypted
    if (!encrypted.accountNumber.isEncrypted ||
        !encrypted.balance.isEncrypted ||
        !encrypted.transactions.isEncrypted) {
      return {
        name: 'Field Encryption',
        status: 'failure',
        error: 'Not all fields were encrypted'
      };
    }

    // Test decryption
    const decrypted = await decryptPortfolioFields(encrypted);
    
    // Verify decrypted data matches original
    if (decrypted.accountNumber !== testData.accountNumber ||
        decrypted.balance !== testData.balance ||
        JSON.stringify(decrypted.transactions) !== JSON.stringify(testData.transactions)) {
      return {
        name: 'Data Integrity',
        status: 'failure',
        error: 'Decrypted data does not match original'
      };
    }

    return {
      name: 'Encryption System',
      status: 'success'
    };
  } catch (error) {
    return {
      name: 'Encryption System',
      status: 'failure',
      error: error.message
    };
  }
}

async function verifyKeyRotation(): Promise<VerificationResult> {
  try {
    // Initialize key rotation
    await KeyRotationManager.initialize();
    
    // Get initial key
    const initialKey = await KeyRotationManager.getCurrentKey();
    
    // Force a key rotation
    await KeyRotationManager.rotateKey();
    
    // Get new key
    const newKey = await KeyRotationManager.getCurrentKey();
    
    // Verify keys are different
    if (initialKey === newKey) {
      return {
        name: 'Key Rotation',
        status: 'failure',
        error: 'Key rotation did not generate a new key'
      };
    }

    // Verify key version incremented
    const version = KeyRotationManager.getCurrentKeyVersion();
    if (version <= 1) {
      return {
        name: 'Key Versioning',
        status: 'failure',
        error: 'Key version not properly incremented'
      };
    }

    return {
      name: 'Key Rotation System',
      status: 'success'
    };
  } catch (error) {
    return {
      name: 'Key Rotation System',
      status: 'failure',
      error: error.message
    };
  }
}

async function verifySecurityFeatures(): Promise<void> {
  console.log('Starting production security verification...\n');

  const results: VerificationResult[] = await Promise.all([
    verifyEncryption(),
    verifyKeyRotation()
  ]);

  console.log('Verification Results:');
  console.log('--------------------');
  
  let hasFailures = false;
  
  results.forEach(result => {
    console.log(`${result.name}: ${result.status}`);
    if (result.error) {
      console.log(`Error: ${result.error}`);
      hasFailures = true;
    }
    console.log('--------------------');
  });

  if (hasFailures) {
    console.error('\nVerification failed! Please check the errors above.');
    process.exit(1);
  } else {
    console.log('\nAll security features verified successfully!');
  }
}

// Run verification if this script is executed directly
if (require.main === module) {
  verifySecurityFeatures().catch(error => {
    console.error('Verification failed:', error);
    process.exit(1);
  });
} 