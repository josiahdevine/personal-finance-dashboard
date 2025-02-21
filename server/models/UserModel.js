// server/models/UserModel.js
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const pool = require('../db'); // Use the centralized pool configuration

const createUserTable = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Users table created (or already exists)");
    } catch (error) {
        console.error("Error creating users table:", error);
        throw error;
    }
};

// Create the table when the module is loaded
createUserTable().catch(err => {
    console.error("Failed to create users table:", err);
    process.exit(1); // Exit if we can't create the table
});

const createUser = async (username, password) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username';
    const values = [username, hashedPassword];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

const findUserByUsername = async (username) => {
    const query = 'SELECT * FROM users WHERE username = $1';
    const { rows } = await pool.query(query, [username]);
    return rows[0];
};

module.exports = { createUser, findUserByUsername };