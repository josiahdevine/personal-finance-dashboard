-- Add Stripe customer ID to user profiles
ALTER TABLE IF EXISTS user_profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);

-- Create subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    stripe_price_id VARCHAR(100) UNIQUE NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'usd',
    billing_interval VARCHAR(20) NOT NULL DEFAULT 'month', -- 'month' or 'year'
    features JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES user_profiles(id) ON DELETE CASCADE,
    stripe_subscription_id VARCHAR(100),
    subscription_status VARCHAR(50) NOT NULL DEFAULT 'inactive',
    plan_id VARCHAR(100) REFERENCES subscription_plans(stripe_price_id),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Create payment history table
CREATE TABLE IF NOT EXISTS payment_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES user_profiles(id) ON DELETE CASCADE,
    stripe_payment_intent_id VARCHAR(100),
    stripe_invoice_id VARCHAR(100),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'usd',
    description TEXT,
    payment_status VARCHAR(50) NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE,
    subscription_id INTEGER REFERENCES user_subscriptions(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on user_id and subscription ID for payment history
CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_subscription_id ON payment_history(subscription_id);

-- Create index on user subscriptions for quick lookups
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_sub_id ON user_subscriptions(stripe_subscription_id);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, description, stripe_price_id, price, currency, billing_interval, features)
VALUES 
    ('Basic', 'Basic financial tracking features', 'price_basic_monthly', 9.99, 'usd', 'month', '{"accounts": 5, "transactions": "unlimited", "budgets": 3, "reports": "basic"}'),
    ('Premium', 'Advanced financial tracking with premium features', 'price_premium_monthly', 19.99, 'usd', 'month', '{"accounts": "unlimited", "transactions": "unlimited", "budgets": "unlimited", "reports": "advanced", "ai_insights": true}'),
    ('Business', 'Complete financial management for businesses', 'price_business_monthly', 49.99, 'usd', 'month', '{"accounts": "unlimited", "transactions": "unlimited", "budgets": "unlimited", "reports": "advanced", "ai_insights": true, "team_members": 5, "invoicing": true}'),
    ('Basic Annual', 'Basic financial tracking features (annual)', 'price_basic_yearly', 99.99, 'usd', 'year', '{"accounts": 5, "transactions": "unlimited", "budgets": 3, "reports": "basic"}'),
    ('Premium Annual', 'Advanced financial tracking with premium features (annual)', 'price_premium_yearly', 199.99, 'usd', 'year', '{"accounts": "unlimited", "transactions": "unlimited", "budgets": "unlimited", "reports": "advanced", "ai_insights": true}'),
    ('Business Annual', 'Complete financial management for businesses (annual)', 'price_business_yearly', 499.99, 'usd', 'year', '{"accounts": "unlimited", "transactions": "unlimited", "budgets": "unlimited", "reports": "advanced", "ai_insights": true, "team_members": 5, "invoicing": true}')
ON CONFLICT (stripe_price_id) DO NOTHING; 