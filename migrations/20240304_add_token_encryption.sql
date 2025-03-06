-- Add encryption fields to plaid_accounts table
ALTER TABLE plaid_accounts
ADD COLUMN IF NOT EXISTS access_token_iv VARCHAR(255),
ADD COLUMN IF NOT EXISTS access_token_tag VARCHAR(255);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_plaid_accounts_user_item 
ON plaid_accounts(user_id, item_id);

-- Add comment for documentation
COMMENT ON TABLE plaid_accounts IS 'Stores Plaid account information with encrypted access tokens';
COMMENT ON COLUMN plaid_accounts.access_token_iv IS 'Initialization vector for access token encryption';
COMMENT ON COLUMN plaid_accounts.access_token_tag IS 'Authentication tag for access token encryption'; 