const pool = require('../db');

// Create tables for Plaid data
async function createPlaidTables() {
    try {
        // Create table for storing Plaid items (connected bank accounts)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS plaid_items (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id),
                plaid_item_id TEXT NOT NULL UNIQUE,
                plaid_access_token TEXT NOT NULL,
                plaid_institution_id TEXT NOT NULL,
                institution_name TEXT NOT NULL,
                status TEXT DEFAULT 'active',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Plaid items table created successfully");

        // Create table for storing account information
        await pool.query(`
            CREATE TABLE IF NOT EXISTS plaid_accounts (
                id SERIAL PRIMARY KEY,
                plaid_item_id TEXT NOT NULL REFERENCES plaid_items(plaid_item_id),
                plaid_account_id TEXT NOT NULL UNIQUE,
                name TEXT NOT NULL,
                official_name TEXT,
                type TEXT NOT NULL,
                subtype TEXT,
                mask TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Plaid accounts table created successfully");

        // Create table for storing account balances over time
        await pool.query(`
            CREATE TABLE IF NOT EXISTS account_balances (
                id SERIAL PRIMARY KEY,
                plaid_account_id TEXT NOT NULL REFERENCES plaid_accounts(plaid_account_id),
                current_balance DECIMAL(19,4) NOT NULL,
                available_balance DECIMAL(19,4),
                limit_balance DECIMAL(19,4),
                iso_currency_code TEXT,
                unofficial_currency_code TEXT,
                timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Account balances table created successfully");

        // Create table for storing balance history
        await pool.query(`
            CREATE TABLE IF NOT EXISTS balance_history (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id),
                account_type TEXT NOT NULL,
                account_id TEXT NOT NULL,
                balance DECIMAL(19,4) NOT NULL,
                is_liability BOOLEAN NOT NULL,
                timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                source TEXT NOT NULL,
                metadata JSONB
            );

            CREATE INDEX IF NOT EXISTS idx_balance_history_user_timestamp 
            ON balance_history(user_id, timestamp);
        `);
        console.log("Balance history table created successfully");

    } catch (error) {
        console.error("Error creating Plaid tables:", error);
        throw error;
    }
}

// Create the tables when the module is loaded
createPlaidTables().catch(err => {
    console.error("Failed to create Plaid tables:", err);
    process.exit(1);
});

// Function to store a new Plaid item
async function storePlaidItem(userId, itemId, accessToken, institutionId, institutionName) {
    const query = `
        INSERT INTO plaid_items 
        (user_id, plaid_item_id, plaid_access_token, plaid_institution_id, institution_name)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
    `;
    const values = [userId, itemId, accessToken, institutionId, institutionName];
    const { rows } = await pool.query(query, values);
    return rows[0];
}

// Function to store accounts for a Plaid item
async function storePlaidAccounts(accounts, plaidItemId) {
    const query = `
        INSERT INTO plaid_accounts
        (plaid_item_id, plaid_account_id, name, official_name, type, subtype, mask)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
    `;
    
    const results = [];
    for (const account of accounts) {
        const values = [
            plaidItemId,
            account.account_id,
            account.name,
            account.official_name,
            account.type,
            account.subtype,
            account.mask
        ];
        const { rows } = await pool.query(query, values);
        results.push(rows[0]);
    }
    return results;
}

// Function to store account balances
async function storeAccountBalances(balances) {
    const query = `
        INSERT INTO account_balances
        (plaid_account_id, current_balance, available_balance, limit_balance, iso_currency_code, unofficial_currency_code)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
    `;
    
    const results = [];
    for (const balance of balances) {
        const values = [
            balance.account_id,
            balance.current,
            balance.available,
            balance.limit,
            balance.iso_currency_code,
            balance.unofficial_currency_code
        ];
        const { rows } = await pool.query(query, values);
        results.push(rows[0]);
    }
    return results;
}

// Function to get all Plaid items for a user
async function getPlaidItemsByUserId(userId) {
    const query = `
        SELECT * FROM plaid_items
        WHERE user_id = $1
        ORDER BY created_at DESC;
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
}

// Function to get all accounts for a Plaid item
async function getAccountsByItemId(plaidItemId) {
    const query = `
        SELECT * FROM plaid_accounts
        WHERE plaid_item_id = $1
        ORDER BY name;
    `;
    const { rows } = await pool.query(query, [plaidItemId]);
    return rows;
}

// Function to get latest balances for all accounts of a user
async function getLatestBalances(userId) {
    const query = `
        WITH latest_balances AS (
            SELECT DISTINCT ON (ab.plaid_account_id)
                ab.*,
                pa.name as account_name,
                pa.type as account_type,
                pi.institution_name
            FROM account_balances ab
            JOIN plaid_accounts pa ON ab.plaid_account_id = pa.plaid_account_id
            JOIN plaid_items pi ON pa.plaid_item_id = pi.plaid_item_id
            WHERE pi.user_id = $1
            ORDER BY ab.plaid_account_id, ab.timestamp DESC
        )
        SELECT * FROM latest_balances
        ORDER BY institution_name, account_name;
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
}

// Add new function to record balance history
async function recordBalanceHistory(userId, accountType, accountId, balance, isLiability, source, metadata = {}) {
    const query = `
        INSERT INTO balance_history 
        (user_id, account_type, account_id, balance, is_liability, source, metadata)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
    `;
    const values = [userId, accountType, accountId, balance, isLiability, source, metadata];
    const { rows } = await pool.query(query, values);
    return rows[0];
}

// Add new function to get balance history
async function getBalanceHistory(userId, startDate, endDate) {
    const query = `
        SELECT 
            timestamp::date as date,
            SUM(CASE WHEN is_liability THEN -balance ELSE balance END) as net_worth,
            SUM(CASE WHEN NOT is_liability THEN balance ELSE 0 END) as total_assets,
            SUM(CASE WHEN is_liability THEN balance ELSE 0 END) as total_liabilities
        FROM balance_history
        WHERE user_id = $1
        AND timestamp BETWEEN $2 AND $3
        GROUP BY timestamp::date
        ORDER BY date ASC;
    `;
    const values = [userId, startDate, endDate];
    const { rows } = await pool.query(query, values);
    return rows;
}

module.exports = {
    storePlaidItem,
    storePlaidAccounts,
    storeAccountBalances,
    getPlaidItemsByUserId,
    getAccountsByItemId,
    getLatestBalances,
    recordBalanceHistory,
    getBalanceHistory
}; 