// server/routes/authRoutes.js
const express = require('express');
const router = express.Router(); // Create a router instance
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db'); // Import the database connection pool

// Secret key for JWT (should be in environment variables)
const secretKey = process.env.JWT_SECRET || 'your-secret-key';
console.log('JWT Secret available:', !!secretKey);
console.log('Environment:', process.env.NODE_ENV);

// Test the database connection - Add this!
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Error connecting to PostgreSQL:', err);
    } else {
        console.log('Connected to PostgreSQL:', res.rows[0].now);
    }
});

// Registration Route
router.post('/register', async (req, res) => {
    try {
        console.log('Registration request received:', {
            headers: req.headers,
            body: { ...req.body, password: '***REDACTED***' }
        });

        const { username, email, password } = req.body;

        // Validate input
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Check if username or email already exists
        const userExists = await pool.query(
            'SELECT * FROM users WHERE username = $1 OR email = $2',
            [username, email]
        );

        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'Username or email already exists' });
        }

        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Insert new user
        const result = await pool.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
            [username, email, passwordHash]
        );

        console.log('User registered successfully:', {
            id: result.rows[0].id,
            username: result.rows[0].username,
            email: result.rows[0].email
        });

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: result.rows[0].id,
                username: result.rows[0].username,
                email: result.rows[0].email
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        
        // Provide more detailed error information
        const errorDetails = {
            message: error.message,
            code: error.code,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        };
        
        console.error('Registration error details:', errorDetails);
        res.status(500).json({ message: 'Internal server error', error: errorDetails.message });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    try {
        console.log('Login request received:', {
            headers: req.headers,
            body: { ...req.body, password: '***REDACTED***' }
        });

        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find user by email
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            console.log('Login failed: User not found for email:', email);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = result.rows[0];

        // Check password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            console.log('Login failed: Invalid password for user:', email);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user.id,
                username: user.username,
                email: user.email
            },
            secretKey,
            { expiresIn: '7d' }
        );

        console.log('Login successful for user:', {
            id: user.id,
            username: user.username,
            email: user.email
        });

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        
        // Provide more detailed error information
        const errorDetails = {
            message: error.message,
            code: error.code,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        };
        
        console.error('Login error details:', errorDetails);
        res.status(500).json({ message: 'Internal server error', error: errorDetails.message });
    }
});

module.exports = router;