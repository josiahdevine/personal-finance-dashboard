-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create plaid_items table
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

-- Create plaid_accounts table
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

-- Create account_balances table
CREATE TABLE IF NOT EXISTS account_balances (
    id SERIAL PRIMARY KEY,
    plaid_account_id TEXT NOT NULL REFERENCES plaid_accounts(plaid_account_id),
    current_balance DECIMAL(19,4) NOT NULL,
    available_balance DECIMAL(19,4),
    limit_balance DECIMAL(19,4),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create manual_accounts table
CREATE TABLE IF NOT EXISTS manual_accounts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    subcategory VARCHAR(50),
    balance DECIMAL(19,4) NOT NULL,
    include_in_total BOOLEAN DEFAULT true,
    additional_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create salary_journal table
CREATE TABLE IF NOT EXISTS salary_journal (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    company VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    salary_amount DECIMAL(19,4) NOT NULL,
    bonus_amount DECIMAL(19,4),
    commission_amount DECIMAL(19,4),
    date_of_change DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create financial_goals table
CREATE TABLE IF NOT EXISTS financial_goals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    target_amount DECIMAL(19,4) NOT NULL,
    current_amount DECIMAL(19,4) DEFAULT 0,
    target_date DATE,
    category VARCHAR(50),
    description TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX idx_plaid_items_user_id ON plaid_items(user_id);
CREATE INDEX idx_plaid_accounts_item_id ON plaid_accounts(plaid_item_id);
CREATE INDEX idx_account_balances_account_id ON account_balances(plaid_account_id);
CREATE INDEX idx_manual_accounts_user_id ON manual_accounts(user_id);
CREATE INDEX idx_salary_journal_user_id ON salary_journal(user_id);
CREATE INDEX idx_financial_goals_user_id ON financial_goals(user_id); 