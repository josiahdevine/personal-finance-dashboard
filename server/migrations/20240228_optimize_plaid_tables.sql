-- Optimize plaid_items table
CREATE TABLE IF NOT EXISTS plaid_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    plaid_item_id TEXT NOT NULL UNIQUE,
    plaid_access_token TEXT NOT NULL,
    plaid_institution_id TEXT NOT NULL,
    institution_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    error_code TEXT,
    error_message TEXT,
    transactions_cursor TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indices for plaid_items
CREATE INDEX IF NOT EXISTS idx_plaid_items_user_id ON plaid_items(user_id);
CREATE INDEX IF NOT EXISTS idx_plaid_items_status ON plaid_items(status);
CREATE INDEX IF NOT EXISTS idx_plaid_items_institution ON plaid_items(plaid_institution_id);

-- Optimize plaid_accounts table
CREATE TABLE IF NOT EXISTS plaid_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    plaid_item_id UUID NOT NULL REFERENCES plaid_items(id),
    plaid_account_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    official_name TEXT,
    type TEXT NOT NULL,
    subtype TEXT,
    mask TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indices for plaid_accounts
CREATE INDEX IF NOT EXISTS idx_plaid_accounts_user_id ON plaid_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_plaid_accounts_item_id ON plaid_accounts(plaid_item_id);
CREATE INDEX IF NOT EXISTS idx_plaid_accounts_type ON plaid_accounts(type);
CREATE INDEX IF NOT EXISTS idx_plaid_accounts_status ON plaid_accounts(status);

-- Optimize transactions table with partitioning
CREATE TABLE IF NOT EXISTS transactions_new (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    plaid_transaction_id TEXT UNIQUE,
    plaid_item_id UUID REFERENCES plaid_items(id),
    account_id UUID REFERENCES plaid_accounts(id),
    amount DECIMAL(12,2) NOT NULL,
    category TEXT[],
    date DATE NOT NULL,
    merchant_name TEXT,
    payment_channel TEXT,
    pending BOOLEAN DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'active',
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (date);

-- Create partitions for transactions (last 2 years by month)
DO $$
DECLARE
    start_date DATE := DATE_TRUNC('month', CURRENT_DATE - INTERVAL '2 years');
    end_date DATE := DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month');
    partition_date DATE;
    partition_name TEXT;
BEGIN
    partition_date := start_date;
    WHILE partition_date < end_date LOOP
        partition_name := 'transactions_' || TO_CHAR(partition_date, 'YYYY_MM');
        EXECUTE format(
            'CREATE TABLE IF NOT EXISTS %I PARTITION OF transactions_new
            FOR VALUES FROM (%L) TO (%L)',
            partition_name,
            partition_date,
            partition_date + INTERVAL '1 month'
        );
        
        -- Add indices for the partition
        EXECUTE format(
            'CREATE INDEX IF NOT EXISTS %I ON %I (user_id, date)',
            'idx_' || partition_name || '_user_date',
            partition_name
        );
        
        partition_date := partition_date + INTERVAL '1 month';
    END LOOP;
END $$;

-- Add indices for transactions
CREATE INDEX IF NOT EXISTS idx_transactions_new_user_id ON transactions_new(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_new_account ON transactions_new(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_new_item ON transactions_new(plaid_item_id);
CREATE INDEX IF NOT EXISTS idx_transactions_new_status ON transactions_new(status);
CREATE INDEX IF NOT EXISTS idx_transactions_new_category ON transactions_new USING GIN(category);

-- Create balance_history table with timescaledb (if available)
CREATE TABLE IF NOT EXISTS balance_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    account_id UUID NOT NULL REFERENCES plaid_accounts(id),
    current_balance DECIMAL(12,2) NOT NULL,
    available_balance DECIMAL(12,2),
    limit_balance DECIMAL(12,2),
    iso_currency_code TEXT,
    unofficial_currency_code TEXT,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add indices for balance_history
CREATE INDEX IF NOT EXISTS idx_balance_history_user_account ON balance_history(user_id, account_id);
CREATE INDEX IF NOT EXISTS idx_balance_history_timestamp ON balance_history(timestamp DESC);

-- Create materialized view for account balances
CREATE MATERIALIZED VIEW IF NOT EXISTS account_balances_mv AS
SELECT 
    account_id,
    user_id,
    current_balance,
    available_balance,
    limit_balance,
    iso_currency_code,
    unofficial_currency_code,
    timestamp
FROM (
    SELECT DISTINCT ON (account_id)
        account_id,
        user_id,
        current_balance,
        available_balance,
        limit_balance,
        iso_currency_code,
        unofficial_currency_code,
        timestamp
    FROM balance_history
    ORDER BY account_id, timestamp DESC
) latest_balances;

-- Add indices for materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_account_balances_mv_account ON account_balances_mv(account_id);
CREATE INDEX IF NOT EXISTS idx_account_balances_mv_user ON account_balances_mv(user_id);

-- Create function to refresh balance materialized view
CREATE OR REPLACE FUNCTION refresh_account_balances_mv()
RETURNS TRIGGER AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY account_balances_mv;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to refresh materialized view
CREATE TRIGGER refresh_account_balances_mv_trigger
    AFTER INSERT OR UPDATE OR DELETE ON balance_history
    FOR EACH STATEMENT
    EXECUTE FUNCTION refresh_account_balances_mv();

-- Create webhook_events table
CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_type TEXT NOT NULL,
    webhook_code TEXT NOT NULL,
    item_id UUID REFERENCES plaid_items(id),
    error JSONB,
    payload JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indices for webhook_events
CREATE INDEX IF NOT EXISTS idx_webhook_events_item ON webhook_events(item_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_type_code ON webhook_events(webhook_type, webhook_code);
CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON webhook_events(status);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created ON webhook_events(created_at DESC);

-- Add function for webhook event processing status
CREATE OR REPLACE FUNCTION update_webhook_event_status()
RETURNS TRIGGER AS $$
BEGIN
    NEW.processed_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for webhook event processing
CREATE TRIGGER update_webhook_event_status_trigger
    BEFORE UPDATE OF status ON webhook_events
    FOR EACH ROW
    WHEN (NEW.status = 'processed')
    EXECUTE FUNCTION update_webhook_event_status();

-- Create sync_events table for tracking sync status
CREATE TABLE IF NOT EXISTS sync_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    plaid_item_id UUID NOT NULL REFERENCES plaid_items(id),
    event_type TEXT NOT NULL,
    added_count INTEGER DEFAULT 0,
    modified_count INTEGER DEFAULT 0,
    removed_count INTEGER DEFAULT 0,
    next_cursor TEXT,
    error JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indices for sync_events
CREATE INDEX IF NOT EXISTS idx_sync_events_item ON sync_events(plaid_item_id);
CREATE INDEX IF NOT EXISTS idx_sync_events_user ON sync_events(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_events_created ON sync_events(created_at DESC);

-- Add comments for documentation
COMMENT ON TABLE plaid_items IS 'Stores Plaid items (connections) for users';
COMMENT ON TABLE plaid_accounts IS 'Stores Plaid accounts associated with items';
COMMENT ON TABLE transactions_new IS 'Stores transactions with partitioning by date';
COMMENT ON TABLE balance_history IS 'Stores historical balance data for accounts';
COMMENT ON TABLE webhook_events IS 'Stores Plaid webhook events for processing';
COMMENT ON TABLE sync_events IS 'Tracks transaction sync status and progress';
COMMENT ON MATERIALIZED VIEW account_balances_mv IS 'Cached view of latest account balances'; 