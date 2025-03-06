-- Create investment accounts table
CREATE TABLE investment_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    plaid_item_id VARCHAR(255),
    plaid_account_id VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    subtype VARCHAR(50),
    institution_name VARCHAR(255),
    institution_logo_url TEXT,
    balance DECIMAL(19,4) NOT NULL DEFAULT 0,
    available_balance DECIMAL(19,4),
    currency_code VARCHAR(3) NOT NULL DEFAULT 'USD',
    is_manual BOOLEAN NOT NULL DEFAULT false,
    is_hidden BOOLEAN NOT NULL DEFAULT false,
    is_closed BOOLEAN NOT NULL DEFAULT false,
    last_updated TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(plaid_account_id)
);

-- Create securities table
CREATE TABLE securities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticker_symbol VARCHAR(20),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    close_price DECIMAL(19,4),
    close_price_as_of TIMESTAMP WITH TIME ZONE,
    isin VARCHAR(12),
    cusip VARCHAR(9),
    currency_code VARCHAR(3) NOT NULL DEFAULT 'USD',
    is_cash_equivalent BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(ticker_symbol),
    UNIQUE(isin),
    UNIQUE(cusip)
);

-- Create investment holdings table
CREATE TABLE investment_holdings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    investment_account_id UUID NOT NULL REFERENCES investment_accounts(id),
    security_id UUID NOT NULL REFERENCES securities(id),
    cost_basis DECIMAL(19,4),
    quantity DECIMAL(19,4) NOT NULL,
    value DECIMAL(19,4) NOT NULL,
    institution_value DECIMAL(19,4),
    institution_price DECIMAL(19,4),
    institution_price_as_of TIMESTAMP WITH TIME ZONE,
    is_manual BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(investment_account_id, security_id)
);

-- Create investment transactions table
CREATE TABLE investment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    investment_account_id UUID NOT NULL REFERENCES investment_accounts(id),
    security_id UUID REFERENCES securities(id),
    transaction_type VARCHAR(50) NOT NULL,
    amount DECIMAL(19,4) NOT NULL,
    quantity DECIMAL(19,4),
    price DECIMAL(19,4),
    fees DECIMAL(19,4),
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    name VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indices for better query performance
CREATE INDEX idx_investment_accounts_user_id ON investment_accounts(user_id);
CREATE INDEX idx_investment_accounts_plaid_item_id ON investment_accounts(plaid_item_id);
CREATE INDEX idx_securities_ticker ON securities(ticker_symbol);
CREATE INDEX idx_holdings_account_id ON investment_holdings(investment_account_id);
CREATE INDEX idx_holdings_security_id ON investment_holdings(security_id);
CREATE INDEX idx_transactions_account_id ON investment_transactions(investment_account_id);
CREATE INDEX idx_transactions_security_id ON investment_transactions(security_id);
CREATE INDEX idx_transactions_date ON investment_transactions(date);

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_investment_accounts_updated_at
    BEFORE UPDATE ON investment_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_securities_updated_at
    BEFORE UPDATE ON securities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investment_holdings_updated_at
    BEFORE UPDATE ON investment_holdings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investment_transactions_updated_at
    BEFORE UPDATE ON investment_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 