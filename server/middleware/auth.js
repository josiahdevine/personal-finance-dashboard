// server/middleware/auth.js
const admin = require('firebase-admin');
const { pool } = require('../db');
const { log, logError } = require('../utils/logger');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault()
    });
}

// Middleware to verify Firebase token and sync user with Neon DB
const authenticateToken = async (req, res, next) => {
    try {
        // Get token from request headers
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({ message: 'No authorization header' });
        }

        const token = authHeader.split(' ')[1]; // Bearer <token>
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        // Verify Firebase token
        const decodedToken = await admin.auth().verifyIdToken(token);
        
        // Sync user with Neon DB
        const user = await syncUserWithDB(decodedToken);
        
        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        logError('Authentication error:', error);
        if (error.code === 'auth/id-token-expired') {
            return res.status(401).json({ message: 'Token expired' });
        }
        res.status(403).json({ message: 'Authentication failed', error: error.message });
    }
};

// Function to sync Firebase user with Neon DB
const syncUserWithDB = async (decodedToken) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Check if user exists
        const { rows } = await client.query(
            'SELECT * FROM users WHERE firebase_uid = $1',
            [decodedToken.uid]
        );

        let user;
        if (rows.length === 0) {
            // Create new user
            const { rows: newUser } = await client.query(
                `INSERT INTO users (firebase_uid, email, display_name, photo_url)
                 VALUES ($1, $2, $3, $4)
                 RETURNING *`,
                [
                    decodedToken.uid,
                    decodedToken.email,
                    decodedToken.name || null,
                    decodedToken.picture || null
                ]
            );
            user = newUser[0];
            log('Created new user in Neon DB:', user.id);
        } else {
            // Update existing user
            const { rows: updatedUser } = await client.query(
                `UPDATE users
                 SET email = $2,
                     display_name = $3,
                     photo_url = $4,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE firebase_uid = $1
                 RETURNING *`,
                [
                    decodedToken.uid,
                    decodedToken.email,
                    decodedToken.name || null,
                    decodedToken.picture || null
                ]
            );
            user = updatedUser[0];
            log('Updated user in Neon DB:', user.id);
        }

        await client.query('COMMIT');
        return user;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

module.exports = { authenticateToken };