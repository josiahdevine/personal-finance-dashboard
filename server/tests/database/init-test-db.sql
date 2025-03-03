-- Initialize test database schema

-- Drop existing objects
DROP TRIGGER IF EXISTS refresh_account_balances_mv_trigger ON balance_history;
DROP TRIGGER IF EXISTS balance_refresh_trigger ON balance_history;
DROP FUNCTION IF EXISTS refresh_account_balances_mv();
DROP FUNCTION IF EXISTS refresh_balance_mv();
DROP MATERIALIZED VIEW IF EXISTS account_balances_mv;

-- Drop tables with CASCADE to handle dependencies
DROP TABLE IF EXISTS transactions_2024_q4 CASCADE;
DROP TABLE IF EXISTS transactions_2024_q3 CASCADE;
DROP TABLE IF EXISTS transactions_2024_q2 CASCADE;
DROP TABLE IF EXISTS transactions_2024_q1 CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS balance_history CASCADE;
DROP TABLE IF EXISTS webhook_events CASCADE;
DROP TABLE IF EXISTS sync_events CASCADE;
DROP TABLE IF EXISTS plaid_accounts CASCADE;
DROP TABLE IF EXISTS plaid_items CASCADE;

-- Create base tables
CREATE TABLE plaid_items (
    id SERIAL PRIMARY KEY,
    item_id VARCHAR(255) NOT NULL UNIQUE,
    access_token VARCHAR(255) NOT NULL,
    user_id UUID NOT NULL,
    institution_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    error_code VARCHAR(100),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE plaid_accounts (
    id SERIAL PRIMARY KEY,
    plaid_item_id INTEGER REFERENCES plaid_items(id) ON DELETE CASCADE,
    account_id VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    mask VARCHAR(4),
    official_name VARCHAR(255),
    type VARCHAR(50) NOT NULL,
    subtype VARCHAR(50),
    verification_status VARCHAR(50),
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE balance_history (
    id SERIAL PRIMARY KEY,
    plaid_account_id INTEGER REFERENCES plaid_accounts(id) ON DELETE CASCADE,
    available_balance DECIMAL(19,4),
    current_balance DECIMAL(19,4),
    limit_amount DECIMAL(19,4),
    iso_currency_code VARCHAR(3),
    unofficial_currency_code VARCHAR(3),
    last_updated_datetime TIMESTAMP WITH TIME ZONE,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
    id SERIAL,
    plaid_account_id INTEGER REFERENCES plaid_accounts(id) ON DELETE CASCADE,
    transaction_id VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    amount DECIMAL(19,4) NOT NULL,
    iso_currency_code VARCHAR(3),
    unofficial_currency_code VARCHAR(3),
    description TEXT NOT NULL,
    merchant_name VARCHAR(255),
    category_id VARCHAR(255),
    pending BOOLEAN DEFAULT FALSE,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id, date)
) PARTITION BY RANGE (date);

-- Create partitions for transactions
CREATE TABLE transactions_2024_q1 PARTITION OF transactions
    FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');

CREATE TABLE transactions_2024_q2 PARTITION OF transactions
    FOR VALUES FROM ('2024-04-01') TO ('2024-07-01');

CREATE TABLE transactions_2024_q3 PARTITION OF transactions
    FOR VALUES FROM ('2024-07-01') TO ('2024-10-01');

CREATE TABLE transactions_2024_q4 PARTITION OF transactions
    FOR VALUES FROM ('2024-10-01') TO ('2025-01-01');

CREATE TABLE webhook_events (
    id SERIAL PRIMARY KEY,
    plaid_item_id INTEGER REFERENCES plaid_items(id) ON DELETE CASCADE,
    webhook_type VARCHAR(100) NOT NULL,
    webhook_code VARCHAR(100) NOT NULL,
    error_code VARCHAR(100),
    error_message TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sync_events (
    id SERIAL PRIMARY KEY,
    plaid_item_id INTEGER REFERENCES plaid_items(id) ON DELETE CASCADE,
    sync_type VARCHAR(50) NOT NULL,
    cursor VARCHAR(255),
    added_count INTEGER DEFAULT 0,
    modified_count INTEGER DEFAULT 0,
    removed_count INTEGER DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    error_code VARCHAR(100),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indices
CREATE INDEX idx_plaid_items_user_id ON plaid_items(user_id);
CREATE INDEX idx_plaid_items_status ON plaid_items(status);
CREATE INDEX idx_plaid_accounts_item_id ON plaid_accounts(plaid_item_id);
CREATE INDEX idx_plaid_accounts_user_id ON plaid_accounts(user_id);
CREATE INDEX idx_transactions_account_id ON transactions(plaid_account_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_new_account ON transactions(plaid_account_id);
CREATE INDEX idx_transactions_new_user_id ON transactions(user_id);
CREATE INDEX idx_balance_history_account_id ON balance_history(plaid_account_id);
CREATE INDEX idx_balance_history_user_account ON balance_history(user_id, plaid_account_id);
CREATE INDEX idx_webhook_events_item ON webhook_events(plaid_item_id);
CREATE INDEX idx_webhook_events_item_id ON webhook_events(plaid_item_id);
CREATE INDEX idx_sync_events_item_id ON sync_events(plaid_item_id);

-- Create materialized view for account balances
CREATE MATERIALIZED VIEW account_balances_mv AS
SELECT 
    a.id as account_id,
    a.name as account_name,
    a.type as account_type,
    a.subtype as account_subtype,
    i.item_id,
    i.institution_id,
    bh.available_balance,
    bh.current_balance,
    bh.limit_amount,
    bh.iso_currency_code,
    bh.last_updated_datetime
FROM plaid_accounts a
JOIN plaid_items i ON a.plaid_item_id = i.id
LEFT JOIN balance_history bh ON a.id = bh.plaid_account_id
WHERE bh.id IN (
    SELECT MAX(id)
    FROM balance_history
    GROUP BY plaid_account_id
);

-- Create refresh function for materialized view
CREATE OR REPLACE FUNCTION refresh_account_balances_mv()
RETURNS TRIGGER AS $$
BEGIN
    REFRESH MATERIALIZED VIEW account_balances_mv;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to refresh materialized view
CREATE TRIGGER refresh_account_balances_mv_trigger
    AFTER INSERT OR UPDATE OR DELETE ON balance_history
    FOR EACH STATEMENT
    EXECUTE FUNCTION refresh_account_balances_mv(); 