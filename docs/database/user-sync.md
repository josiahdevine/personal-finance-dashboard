# User Synchronization Documentation

## Overview
The User Sync module manages the synchronization of Firebase user data with the application's PostgreSQL database. It handles user creation, updates, and retrieval operations while maintaining data consistency between Firebase and the local database.

## Features
- Automatic user synchronization with Firebase
- User data persistence in PostgreSQL
- Robust error handling and logging
- Automatic timestamp management

## API Reference

### `syncUser(user)`
Synchronizes a Firebase user with the local database.

**Parameters:**
- `user` (object): Firebase user object containing:
  - `uid` (string): Firebase user ID
  - `email` (string): User's email address
  - `email_verified` (boolean): Email verification status
  - `name` or `displayName` (string): User's display name
  - `photoURL` (string): URL to user's profile photo

**Returns:** Promise<object> - The synchronized user record

**Example:**
```javascript
const firebaseUser = {
  uid: 'firebase123',
  email: 'user@example.com',
  email_verified: true,
  displayName: 'John Doe',
  photoURL: 'https://example.com/photo.jpg'
};

const syncedUser = await syncUser(firebaseUser);
```

### `getUserByFirebaseUid(firebaseUid)`
Retrieves a user from the database by their Firebase UID.

**Parameters:**
- `firebaseUid` (string): Firebase user ID

**Returns:** Promise<object|null> - User object if found, null otherwise

**Example:**
```javascript
const user = await getUserByFirebaseUid('firebase123');
if (user) {
  console.log('User found:', user.display_name);
} else {
  console.log('User not found');
}
```

## Database Schema
The users table schema includes:
```sql
CREATE TABLE users (
  firebase_uid VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  email_verified BOOLEAN,
  display_name VARCHAR(255),
  photo_url TEXT,
  created_at TIMESTAMP,
  last_sign_in TIMESTAMP
);
```

## Error Handling
The module implements error handling for:
- Database connection issues
- Query failures
- Data validation errors
- Firebase synchronization failures

All errors are logged using the application's logging system with relevant context.

## Best Practices
1. Always use the `syncUser` function when updating user data
2. Handle potential null returns from `getUserByFirebaseUid`
3. Implement proper error handling in calling code
4. Monitor synchronization logs for potential issues
5. Regularly verify data consistency between Firebase and local database

## Dependencies
- `db-connector.js`: Database connection management
- `logger.js`: Application logging system
- Firebase Authentication

## Environment Variables
Required environment variables:
- Database configuration (via db-connector)
- Firebase configuration (via Firebase initialization)

## Example Usage
```javascript
import { syncUser, getUserByFirebaseUid } from './user-sync.js';

// After Firebase authentication
firebase.auth().onAuthStateChanged(async (firebaseUser) => {
  if (firebaseUser) {
    try {
      // Sync user data
      const user = await syncUser(firebaseUser);
      console.log('User synchronized:', user.display_name);
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }
});

// Retrieve user data
try {
  const user = await getUserByFirebaseUid('firebase123');
  if (user) {
    // Use user data
  }
} catch (error) {
  console.error('User retrieval failed:', error);
}
``` 