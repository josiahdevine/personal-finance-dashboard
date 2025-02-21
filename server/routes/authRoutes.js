// server/routes/authRoutes.js
const express = require('express');
const router = express.Router(); // Create a router instance
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db'); // Import the database connection pool

// Secret key for JWT (should be in environment variables)
const secretKey = process.env.JWT_SECRET || 'your-secret-key';

// Test the database connection - Add this!
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Error connecting to PostgreSQL:', err);
    } else {
        console.log('Connected to PostgreSQL:', res.rows[0].now);
    }
});

// Registration Route
router.post('/register', async (req, res, next) => {
    try {
        console.log('Registration request received:', req.body);

        // Validate request body
        if (!req.body.username || !req.body.password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        const { username, password } = req.body;

        // Validate username and password
        if (username.length < 3) {
            return res.status(400).json({ message: 'Username must be at least 3 characters long' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        // Check if username exists
        const existingUser = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        const result = await pool.query(
            'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
            [username, hashedPassword]
        );

        console.log('User registered successfully:', username);
        res.status(201).json({
            message: 'Registration successful',
            user: {
                id: result.rows[0].id,
                username: result.rows[0].username
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        next(error); // Pass error to error handling middleware
    }
});

// Login Route
router.post('/login', async (req, res, next) => {
    try {
        console.log('Login request received:', req.body);
        
        if (!req.body.username || !req.body.password) {
            console.log('Missing username or password');
            return res.status(400).json({ message: 'Username and password are required' });
        }

        const { username, password } = req.body;

        const query = 'SELECT * FROM users WHERE username = $1';
        console.log('Executing query:', query, 'with username:', username);
        
        const { rows } = await pool.query(query, [username]);
        const user = rows[0];

        if (!user) {
            console.log('User not found:', username);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        console.log('Checking password for user:', username);
        const passwordMatch = await bcrypt.compare(password, user.password);
        
        if (!passwordMatch) {
            console.log('Password mismatch for user:', username);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate token with longer expiration (7 days)
        console.log('Generating token for user:', username);
        const token = jwt.sign(
            { 
                userId: user.id, 
                username: user.username 
            }, 
            secretKey, 
            { expiresIn: '7d' }
        );

        console.log('Login successful for user:', username);
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        next(error);
    }
});

module.exports = router;