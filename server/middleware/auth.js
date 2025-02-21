// server/middleware/auth.js
const jwt = require('jsonwebtoken');

// Secret key for JWT (should be in environment variables)
const secretKey = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    try {
        // Get token from request headers
        const authHeader = req.headers['authorization'];
        console.log('Auth header:', authHeader);

        if (!authHeader) {
            console.log('No authorization header');
            return res.status(401).json({ message: 'No authorization header' });
        }

        const token = authHeader.split(' ')[1]; // Bearer <token>

        if (!token) {
            console.log('No token found in auth header');
            return res.status(401).json({ message: 'No token provided' });
        }

        jwt.verify(token, secretKey, (err, user) => {
            if (err) {
                console.error('Token verification failed:', err.message);
                if (err.name === 'TokenExpiredError') {
                    return res.status(401).json({ message: 'Token expired' });
                }
                return res.status(403).json({ message: 'Invalid token' });
            }

            console.log('Token verified successfully for user:', user);
            req.user = user;
            next();
        });
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({ message: 'Authentication error', error: error.message });
    }
};

module.exports = { authenticateToken };