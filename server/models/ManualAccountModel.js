const pool = require('../db');

// Create the manual_accounts table if it doesn't exist
async function createManualAccountsTable() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS manual_accounts (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id),
                name VARCHAR(255) NOT NULL,
                type VARCHAR(50) NOT NULL,
                category VARCHAR(50) NOT NULL,
                subcategory VARCHAR(50) NOT NULL,
                balance DECIMAL(15, 2) NOT NULL,
                additional_details JSONB,
                last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            -- Create index for faster queries
            CREATE INDEX IF NOT EXISTS idx_manual_accounts_user_id ON manual_accounts(user_id);
            CREATE INDEX IF NOT EXISTS idx_manual_accounts_type ON manual_accounts(type);
            CREATE INDEX IF NOT EXISTS idx_manual_accounts_category ON manual_accounts(category);
        `);
        console.log("Manual accounts table created successfully");
    } catch (error) {
        console.error("Error creating manual accounts table:", error);
        throw error;
    }
}

// Create the table when the module is loaded
createManualAccountsTable().catch(err => {
    console.error("Failed to create manual accounts table:", err);
    process.exit(1);
});

// Function to add a new manual account
async function addManualAccount(userId, accountData) {
    const {
        name,
        type,
        category,
        subcategory,
        balance,
        additional_details
    } = accountData;

    const query = `
        INSERT INTO manual_accounts 
        (user_id, name, type, category, subcategory, balance, additional_details)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
    `;
    const values = [userId, name, type, category, subcategory, balance, additional_details];
    
    const { rows } = await pool.query(query, values);
    return rows[0];
}

// Function to update a manual account
async function updateManualAccount(accountId, userId, accountData) {
    const {
        name,
        type,
        category,
        subcategory,
        balance,
        additional_details
    } = accountData;

    const query = `
        UPDATE manual_accounts
        SET name = $1,
            type = $2,
            category = $3,
            subcategory = $4,
            balance = $5,
            additional_details = $6,
            last_updated = CURRENT_TIMESTAMP
        WHERE id = $7 AND user_id = $8
        RETURNING *;
    `;
    const values = [name, type, category, subcategory, balance, additional_details, accountId, userId];
    
    const { rows } = await pool.query(query, values);
    return rows[0];
}

// Function to delete a manual account
async function deleteManualAccount(accountId, userId) {
    const query = `
        DELETE FROM manual_accounts
        WHERE id = $1 AND user_id = $2
        RETURNING *;
    `;
    const { rows } = await pool.query(query, [accountId, userId]);
    return rows[0];
}

// Function to get all manual accounts for a user
async function getManualAccounts(userId) {
    const query = `
        SELECT *
        FROM manual_accounts
        WHERE user_id = $1
        ORDER BY category, subcategory, name;
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
}

// Function to get a single manual account
async function getManualAccount(accountId, userId) {
    const query = `
        SELECT *
        FROM manual_accounts
        WHERE id = $1 AND user_id = $2;
    `;
    const { rows } = await pool.query(query, [accountId, userId]);
    return rows[0];
}

module.exports = {
    addManualAccount,
    updateManualAccount,
    deleteManualAccount,
    getManualAccounts,
    getManualAccount
}; 