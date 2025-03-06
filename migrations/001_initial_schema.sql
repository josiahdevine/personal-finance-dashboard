-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    firebase_uid VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Plaid accounts table
CREATE TABLE IF NOT EXISTS plaid_accounts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    plaid_item_id VARCHAR(255) NOT NULL,
    plaid_access_token VARCHAR(255) NOT NULL,
    institution_name VARCHAR(255),
    institution_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, plaid_item_id)
);

-- Bank accounts table
CREATE TABLE IF NOT EXISTS bank_accounts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    plaid_account_id INTEGER REFERENCES plaid_accounts(id),
    account_name VARCHAR(255) NOT NULL,
    account_type VARCHAR(50) NOT NULL,
    account_subtype VARCHAR(50),
    institution_name VARCHAR(255),
    current_balance DECIMAL(19,4),
    available_balance DECIMAL(19,4),
    mask VARCHAR(4),
    is_manual BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    bank_account_id INTEGER REFERENCES bank_accounts(id),
    plaid_transaction_id VARCHAR(255),
    amount DECIMAL(19,4) NOT NULL,
    date DATE NOT NULL,
    name VARCHAR(255) NOT NULL,
    merchant_name VARCHAR(255),
    category VARCHAR(255),
    subcategory VARCHAR(255),
    pending BOOLEAN DEFAULT false,
    is_manual BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Investment accounts table
CREATE TABLE IF NOT EXISTS investment_accounts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    plaid_account_id INTEGER REFERENCES plaid_accounts(id),
    account_name VARCHAR(255) NOT NULL,
    institution_name VARCHAR(255),
    current_balance DECIMAL(19,4),
    is_manual BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Investment holdings table
CREATE TABLE IF NOT EXISTS investment_holdings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    investment_account_id INTEGER REFERENCES investment_accounts(id),
    security_id VARCHAR(255),
    symbol VARCHAR(50),
    name VARCHAR(255),
    quantity DECIMAL(19,4),
    price DECIMAL(19,4),
    value DECIMAL(19,4),
    cost_basis DECIMAL(19,4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bills table
CREATE TABLE IF NOT EXISTS bills (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(19,4) NOT NULL,
    due_date DATE NOT NULL,
    frequency VARCHAR(50) NOT NULL,
    category VARCHAR(255),
    status VARCHAR(50),
    auto_pay BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Goals table
CREATE TABLE IF NOT EXISTS goals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    target_amount DECIMAL(19,4) NOT NULL,
    current_amount DECIMAL(19,4) DEFAULT 0,
    target_date DATE,
    category VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(19,4) NOT NULL,
    billing_date DATE NOT NULL,
    frequency VARCHAR(50) NOT NULL,
    category VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Analytics settings table
CREATE TABLE IF NOT EXISTS analytics_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) UNIQUE,
    budget_tracking BOOLEAN DEFAULT true,
    investment_tracking BOOLEAN DEFAULT true,
    subscription_tracking BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_transactions_user_id_date ON transactions(user_id, date);
CREATE INDEX idx_bank_accounts_user_id ON bank_accounts(user_id);
CREATE INDEX idx_investment_accounts_user_id ON investment_accounts(user_id);
CREATE INDEX idx_bills_user_id_due_date ON bills(user_id, due_date);
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id); 