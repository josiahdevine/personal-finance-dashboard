-- Create loan_details table
CREATE TABLE IF NOT EXISTS loan_details (
    id SERIAL PRIMARY KEY,
    manual_account_id INTEGER NOT NULL REFERENCES manual_accounts(id) ON DELETE CASCADE,
    principal_amount DECIMAL(19,4) NOT NULL,
    interest_rate DECIMAL(6,4) NOT NULL,  -- Allows for rates up to 99.9999%
    loan_term_months INTEGER NOT NULL,
    payment_amount DECIMAL(19,4) NOT NULL,
    start_date DATE NOT NULL,
    next_payment_date DATE NOT NULL,
    remaining_payments INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create loan_payments table
CREATE TABLE IF NOT EXISTS loan_payments (
    id SERIAL PRIMARY KEY,
    loan_detail_id INTEGER NOT NULL REFERENCES loan_details(id) ON DELETE CASCADE,
    payment_date DATE NOT NULL,
    payment_amount DECIMAL(19,4) NOT NULL,
    principal_portion DECIMAL(19,4) NOT NULL,
    interest_portion DECIMAL(19,4) NOT NULL,
    extra_payment DECIMAL(19,4) DEFAULT 0,
    remaining_balance DECIMAL(19,4) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create investment_details table
CREATE TABLE IF NOT EXISTS investment_details (
    id SERIAL PRIMARY KEY,
    manual_account_id INTEGER NOT NULL REFERENCES manual_accounts(id) ON DELETE CASCADE,
    symbol VARCHAR(10),  -- For stocks, ETFs, etc.
    quantity DECIMAL(19,8) NOT NULL,  -- Allow for fractional shares
    cost_basis_per_unit DECIMAL(19,4),
    total_cost_basis DECIMAL(19,4) NOT NULL,
    purchase_date DATE NOT NULL,
    last_price_update TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create investment_price_history table
CREATE TABLE IF NOT EXISTS investment_price_history (
    id SERIAL PRIMARY KEY,
    investment_detail_id INTEGER NOT NULL REFERENCES investment_details(id) ON DELETE CASCADE,
    price_date DATE NOT NULL,
    price DECIMAL(19,4) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add new columns to manual_accounts table
ALTER TABLE manual_accounts
ADD COLUMN IF NOT EXISTS interest_rate DECIMAL(6,4),
ADD COLUMN IF NOT EXISTS compound_frequency VARCHAR(20),
ADD COLUMN IF NOT EXISTS last_interest_calculation TIMESTAMP WITH TIME ZONE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_loan_details_account_id ON loan_details(manual_account_id);
CREATE INDEX IF NOT EXISTS idx_loan_payments_loan_id ON loan_payments(loan_detail_id);
CREATE INDEX IF NOT EXISTS idx_investment_details_account_id ON investment_details(manual_account_id);
CREATE INDEX IF NOT EXISTS idx_investment_price_history_detail_id ON investment_price_history(investment_detail_id);
CREATE INDEX IF NOT EXISTS idx_investment_price_history_date ON investment_price_history(price_date);

-- Add triggers for updated_at timestamps
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

CREATE TRIGGER update_loan_details_updated_at
    BEFORE UPDATE ON loan_details
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investment_details_updated_at
    BEFORE UPDATE ON investment_details
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 