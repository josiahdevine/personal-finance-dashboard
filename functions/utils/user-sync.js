/**
 * User Sync Utility
 * Syncs Firebase users to our database
 */

import dbConnector from './db-connector.js';
import { createLogger } from './logger.js';

const logger = createLogger('user-sync');

/**
 * Sync a Firebase user to our database
 * @param {object} user - Firebase user object
 * @returns {Promise<object>} The synced user object
 */
export async function syncUser(user) {
  const pool = dbConnector.getDbPool();
  if (!pool) {
    throw new Error('Database connection not available');
  }

  try {
    // Check if user exists
    const existingUser = await dbConnector.query(
      'SELECT * FROM users WHERE firebase_uid = $1',
      [user.uid]
    );

    if (existingUser.rows.length > 0) {
      // Update existing user
      const result = await dbConnector.query(
        `UPDATE users 
         SET email = $1, 
             email_verified = $2, 
             display_name = $3, 
             photo_url = $4,
             last_sign_in = NOW()
         WHERE firebase_uid = $5
         RETURNING *`,
        [
          user.email,
          user.email_verified,
          user.name || user.displayName,
          user.photoURL,
          user.uid
        ]
      );
      return result.rows[0];
    } else {
      // Create new user
      const result = await dbConnector.query(
        `INSERT INTO users (
          firebase_uid,
          email,
          email_verified,
          display_name,
          photo_url,
          created_at,
          last_sign_in
        ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        RETURNING *`,
        [
          user.uid,
          user.email,
          user.email_verified,
          user.name || user.displayName,
          user.photoURL
        ]
      );
      return result.rows[0];
    }
  } catch (error) {
    logger.error('Error syncing user:', {
      error: error.message,
      userId: user.uid,
      email: user.email
    });
    throw error;
  }
}

/**
 * Get user from database by Firebase UID
 * @param {string} firebaseUid - Firebase user ID
 * @returns {Promise<object|null>} User object or null if not found
 */
export async function getUserByFirebaseUid(firebaseUid) {
  const pool = dbConnector.getDbPool();
  if (!pool) {
    throw new Error('Database connection not available');
  }

  try {
    const result = await dbConnector.query(
      'SELECT * FROM users WHERE firebase_uid = $1',
      [firebaseUid]
    );
    return result.rows[0] || null;
  } catch (error) {
    logger.error('Error getting user:', {
      error: error.message,
      firebaseUid
    });
    throw error;
  }
} 