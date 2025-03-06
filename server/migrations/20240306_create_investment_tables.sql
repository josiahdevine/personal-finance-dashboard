-- Create investment accounts table
CREATE TABLE IF NOT EXISTS investment_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plaid_item_id VARCHAR(255),
    plaid_account_id VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'investment', 'retirement', 'checking', 'savings'
    subtype VARCHAR(50),
    institution_name VARCHAR(255),
    institution_logo_url TEXT,
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
    available_balance DECIMAL(15, 2),
    currency_code VARCHAR(3) NOT NULL DEFAULT 'USD',
    is_manual BOOLEAN NOT NULL DEFAULT false,
    is_hidden BOOLEAN NOT NULL DEFAULT false,
    is_closed BOOLEAN NOT NULL DEFAULT false,
    last_updated TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(plaid_account_id)
);

-- Create securities table
CREATE TABLE IF NOT EXISTS securities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticker_symbol VARCHAR(20),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    close_price DECIMAL(15, 2),
    close_price_as_of TIMESTAMP WITH TIME ZONE,
    isin VARCHAR(12),
    cusip VARCHAR(9),
    currency_code VARCHAR(3) NOT NULL DEFAULT 'USD',
    is_cash_equivalent BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(ticker_symbol)
);

-- Create investment holdings table
CREATE TABLE IF NOT EXISTS investment_holdings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investment_account_id UUID NOT NULL REFERENCES investment_accounts(id) ON DELETE CASCADE,
    security_id UUID NOT NULL REFERENCES securities(id) ON DELETE CASCADE,
    cost_basis DECIMAL(15, 2),
    quantity DECIMAL(15, 6) NOT NULL,
    value DECIMAL(15, 2) NOT NULL,
    institution_value DECIMAL(15, 2),
    institution_price DECIMAL(15, 2),
    institution_price_as_of TIMESTAMP WITH TIME ZONE,
    is_manual BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create investment transactions table
CREATE TABLE IF NOT EXISTS investment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investment_account_id UUID NOT NULL REFERENCES investment_accounts(id) ON DELETE CASCADE,
    security_id UUID REFERENCES securities(id) ON DELETE SET NULL,
    transaction_type VARCHAR(50) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    quantity DECIMAL(15, 6),
    price DECIMAL(15, 2),
    fees DECIMAL(15, 2),
    date DATE NOT NULL,
    name VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create financial health scores table
CREATE TABLE IF NOT EXISTS financial_health_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    overall_score INTEGER NOT NULL CHECK (overall_score BETWEEN 0 AND 100),
    emergency_savings_score INTEGER NOT NULL CHECK (emergency_savings_score BETWEEN 0 AND 100),
    debt_score INTEGER NOT NULL CHECK (debt_score BETWEEN 0 AND 100),
    retirement_score INTEGER NOT NULL CHECK (retirement_score BETWEEN 0 AND 100),
    spending_score INTEGER NOT NULL CHECK (spending_score BETWEEN 0 AND 100),
    insurance_score INTEGER NOT NULL CHECK (insurance_score BETWEEN 0 AND 100),
    credit_score INTEGER NOT NULL CHECK (credit_score BETWEEN 0 AND 100),
    status VARCHAR(20) NOT NULL CHECK (status IN ('excellent', 'good', 'fair', 'poor')),
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create financial health recommendations table
CREATE TABLE IF NOT EXISTS financial_health_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    component VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    priority INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX idx_investment_accounts_user ON investment_accounts(user_id);
CREATE INDEX idx_investment_accounts_plaid ON investment_accounts(plaid_account_id);
CREATE INDEX idx_holdings_account ON investment_holdings(investment_account_id);
CREATE INDEX idx_holdings_security ON investment_holdings(security_id);
CREATE INDEX idx_transactions_account ON investment_transactions(investment_account_id);
CREATE INDEX idx_transactions_security ON investment_transactions(security_id);
CREATE INDEX idx_transactions_date ON investment_transactions(date);
CREATE INDEX idx_financial_health_user ON financial_health_scores(user_id, calculated_at);
CREATE INDEX idx_financial_recommendations_user ON financial_health_recommendations(user_id, status);

-- Create trigger for updating updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to all relevant tables
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