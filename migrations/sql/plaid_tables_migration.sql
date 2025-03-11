-- Plaid Tables Migration Script
-- This script creates or updates the necessary tables for Plaid integration

-- Create table for storing Plaid items (connected bank accounts)
CREATE TABLE IF NOT EXISTS plaid_items (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    plaid_item_id TEXT NOT NULL UNIQUE,
    plaid_access_token TEXT NOT NULL,
    plaid_institution_id TEXT NOT NULL,
    institution_name TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    error_code TEXT,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create table for storing account information
CREATE TABLE IF NOT EXISTS plaid_accounts (
    id SERIAL PRIMARY KEY,
    plaid_item_id TEXT NOT NULL REFERENCES plaid_items(plaid_item_id) ON DELETE CASCADE,
    plaid_account_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    official_name TEXT,
    type TEXT NOT NULL,
    subtype TEXT,
    mask TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    is_hidden BOOLEAN DEFAULT FALSE,
    is_interest_bearing BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create table for storing account balances over time
CREATE TABLE IF NOT EXISTS account_balances (
    id SERIAL PRIMARY KEY,
    plaid_account_id TEXT NOT NULL REFERENCES plaid_accounts(plaid_account_id) ON DELETE CASCADE,
    current_balance DECIMAL(19,4) NOT NULL,
    available_balance DECIMAL(19,4),
    limit_balance DECIMAL(19,4),
    iso_currency_code TEXT,
    unofficial_currency_code TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create table for storing balance history
CREATE TABLE IF NOT EXISTS balance_history (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    account_type TEXT NOT NULL,
    account_id TEXT NOT NULL,
    balance DECIMAL(19,4) NOT NULL,
    is_liability BOOLEAN NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    source TEXT NOT NULL,
    metadata JSONB
);

-- Create table for storing transaction data
CREATE TABLE IF NOT EXISTS plaid_transactions (
    id SERIAL PRIMARY KEY,
    plaid_account_id TEXT NOT NULL REFERENCES plaid_accounts(plaid_account_id) ON DELETE CASCADE,
    transaction_id TEXT NOT NULL UNIQUE,
    user_id TEXT NOT NULL,
    category_id TEXT,
    category TEXT[],
    transaction_type TEXT,
    name TEXT NOT NULL,
    amount DECIMAL(19,4) NOT NULL,
    iso_currency_code TEXT,
    date DATE NOT NULL,
    pending BOOLEAN,
    merchant_name TEXT,
    payment_channel TEXT,
    location JSONB,
    is_deleted BOOLEAN DEFAULT FALSE,
    is_hidden BOOLEAN DEFAULT FALSE,
    is_manual BOOLEAN DEFAULT FALSE,
    custom_category TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create table for transaction sync cursor
CREATE TABLE IF NOT EXISTS plaid_sync_cursor (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    cursor TEXT,
    last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create table for webhook events
CREATE TABLE IF NOT EXISTS plaid_webhooks (
    id SERIAL PRIMARY KEY,
    webhook_type TEXT NOT NULL,
    webhook_code TEXT NOT NULL,
    item_id TEXT REFERENCES plaid_items(plaid_item_id),
    user_id TEXT,
    payload JSONB,
    status TEXT DEFAULT 'received',
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indices for better query performance
CREATE INDEX IF NOT EXISTS idx_plaid_items_user_id ON plaid_items(user_id);
CREATE INDEX IF NOT EXISTS idx_plaid_accounts_plaid_item_id ON plaid_accounts(plaid_item_id);
CREATE INDEX IF NOT EXISTS idx_account_balances_plaid_account_id ON account_balances(plaid_account_id);
CREATE INDEX IF NOT EXISTS idx_balance_history_user_timestamp ON balance_history(user_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_plaid_transactions_user_id ON plaid_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_plaid_transactions_date ON plaid_transactions(date);
CREATE INDEX IF NOT EXISTS idx_plaid_transactions_account_id ON plaid_transactions(plaid_account_id);
CREATE INDEX IF NOT EXISTS idx_plaid_webhooks_item_id ON plaid_webhooks(item_id);

-- Create or replace function to update timestamp on record update
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update timestamps
DO $$
BEGIN
    -- For plaid_items
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_plaid_items_timestamp') THEN
        CREATE TRIGGER update_plaid_items_timestamp
        BEFORE UPDATE ON plaid_items
        FOR EACH ROW
        EXECUTE FUNCTION update_timestamp();
    END IF;
    
    -- For plaid_accounts
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_plaid_accounts_timestamp') THEN
        CREATE TRIGGER update_plaid_accounts_timestamp
        BEFORE UPDATE ON plaid_accounts
        FOR EACH ROW
        EXECUTE FUNCTION update_timestamp();
    END IF;
    
    -- For plaid_transactions
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_plaid_transactions_timestamp') THEN
        CREATE TRIGGER update_plaid_transactions_timestamp
        BEFORE UPDATE ON plaid_transactions
        FOR EACH ROW
        EXECUTE FUNCTION update_timestamp();
    END IF;
END $$; 