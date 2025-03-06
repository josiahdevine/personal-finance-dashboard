-- Create table for storing recurring transaction patterns
CREATE TABLE IF NOT EXISTS recurring_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    merchant_name VARCHAR(255) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    frequency VARCHAR(20) NOT NULL, -- weekly, biweekly, monthly, quarterly, annual
    day_of_month INTEGER,
    last_date DATE NOT NULL,
    next_predicted_date DATE NOT NULL,
    category VARCHAR(100),
    confidence INTEGER NOT NULL, -- 0-100
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create table for storing cash flow predictions
CREATE TABLE IF NOT EXISTS cash_flow_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    prediction_date DATE NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    confidence_low DECIMAL(12,2) NOT NULL,
    confidence_high DECIMAL(12,2) NOT NULL,
    model_type VARCHAR(50) NOT NULL, -- time-series, recurring-transaction, hybrid
    timeframe VARCHAR(20) NOT NULL, -- daily, weekly, monthly
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create table for storing prediction model metrics
CREATE TABLE IF NOT EXISTS prediction_model_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    model_type VARCHAR(50) NOT NULL,
    accuracy DECIMAL(5,2) NOT NULL,
    mean_absolute_error DECIMAL(12,2) NOT NULL,
    mean_squared_error DECIMAL(12,2) NOT NULL,
    root_mean_squared_error DECIMAL(12,2) NOT NULL,
    validation_start_date DATE NOT NULL,
    validation_end_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create table for storing financial health scores
CREATE TABLE IF NOT EXISTS financial_health_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    overall_score INTEGER NOT NULL,
    emergency_savings_score INTEGER NOT NULL,
    debt_score INTEGER NOT NULL,
    retirement_score INTEGER NOT NULL,
    spending_score INTEGER NOT NULL,
    insurance_score INTEGER NOT NULL,
    credit_score INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL, -- excellent, good, fair, poor
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_recurring_transactions_user_id ON recurring_transactions(user_id);
CREATE INDEX idx_recurring_transactions_next_date ON recurring_transactions(next_predicted_date);
CREATE INDEX idx_cash_flow_predictions_user_date ON cash_flow_predictions(user_id, prediction_date);
CREATE INDEX idx_prediction_metrics_user_model ON prediction_model_metrics(user_id, model_type);
CREATE INDEX idx_financial_health_user_date ON financial_health_scores(user_id, calculated_at);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_recurring_transactions_updated_at
    BEFORE UPDATE ON recurring_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 