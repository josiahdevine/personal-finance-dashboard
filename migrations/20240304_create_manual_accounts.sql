-- Create manual_accounts table
CREATE TABLE IF NOT EXISTS manual_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_name VARCHAR(255) NOT NULL,
    account_type VARCHAR(50) NOT NULL,
    balance DECIMAL(19,4) NOT NULL DEFAULT 0,
    institution VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_account_type CHECK (account_type IN ('checking', 'savings', 'credit', 'investment', 'other')),
    CONSTRAINT positive_balance CHECK (balance >= 0)
);

-- Create indices for better query performance
CREATE INDEX IF NOT EXISTS idx_manual_accounts_user_id ON manual_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_manual_accounts_type ON manual_accounts(account_type);

-- Add trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_manual_accounts_updated_at
    BEFORE UPDATE ON manual_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE manual_accounts IS 'Stores manually added financial accounts';
COMMENT ON COLUMN manual_accounts.user_id IS 'Reference to the user who owns this account';
COMMENT ON COLUMN manual_accounts.account_type IS 'Type of account (checking, savings, credit, investment, other)';
COMMENT ON COLUMN manual_accounts.balance IS 'Current balance of the account'; 