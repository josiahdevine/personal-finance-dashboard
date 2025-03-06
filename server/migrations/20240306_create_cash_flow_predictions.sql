-- Create table for cash flow predictions
CREATE TABLE IF NOT EXISTS cash_flow_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    prediction_date DATE NOT NULL,
    predicted_amount DECIMAL(15, 2) NOT NULL,
    category VARCHAR(255) NOT NULL,
    prediction_type VARCHAR(50) NOT NULL, -- 'recurring' or 'pattern'
    confidence_score DECIMAL(5, 2), -- Optional confidence score
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_cash_flow_predictions_user_date ON cash_flow_predictions(user_id, prediction_date);
CREATE INDEX IF NOT EXISTS idx_cash_flow_predictions_date ON cash_flow_predictions(prediction_date);

-- Create trigger for updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_cash_flow_predictions_updated_at ON cash_flow_predictions;
CREATE TRIGGER update_cash_flow_predictions_updated_at
    BEFORE UPDATE ON cash_flow_predictions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 