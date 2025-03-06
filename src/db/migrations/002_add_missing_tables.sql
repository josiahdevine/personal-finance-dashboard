-- Check and create missing tables with integer IDs

-- Budget categories table
CREATE TABLE IF NOT EXISTS budget_categories (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    monthly_limit DECIMAL(12,2) NOT NULL,
    color VARCHAR(7),
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, name)
);

-- Budget entries table
CREATE TABLE IF NOT EXISTS budget_entries (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES budget_categories(id) ON DELETE CASCADE,
    month DATE NOT NULL,
    spent_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(category_id, month)
);

-- Create triggers for updated_at timestamps if they don't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for new tables
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_budget_categories_updated_at') THEN
        CREATE TRIGGER update_budget_categories_updated_at
            BEFORE UPDATE ON budget_categories
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_budget_entries_updated_at') THEN
        CREATE TRIGGER update_budget_entries_updated_at
            BEFORE UPDATE ON budget_entries
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Create indexes for better query performance
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'idx_budget_entries_category_month' AND n.nspname = 'public') THEN
        CREATE INDEX idx_budget_entries_category_month ON budget_entries(category_id, month);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'idx_salary_entries_user_id_date' AND n.nspname = 'public') THEN
        CREATE INDEX idx_salary_entries_user_id_date ON salary_entries(user_id, date_of_change);
    END IF;
END $$; 