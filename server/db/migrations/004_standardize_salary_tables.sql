-- First, create a backup of existing data
CREATE TABLE IF NOT EXISTS salary_entries_backup AS 
SELECT * FROM salary_entries;

CREATE TABLE IF NOT EXISTS salary_journal_backup AS 
SELECT * FROM salary_journal;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS salary_entries CASCADE;
DROP TABLE IF EXISTS salary_journal CASCADE;

-- Create the standardized salary_entries table
CREATE TABLE salary_entries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    user_profile_id VARCHAR(50) DEFAULT 'primary',
    company VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    salary_amount DECIMAL(19,4) NOT NULL,
    date_of_change DATE NOT NULL,
    notes TEXT,
    bonus_amount DECIMAL(19,4) DEFAULT 0,
    commission_amount DECIMAL(19,4) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_salary_entries_user_id ON salary_entries(user_id);
CREATE INDEX idx_salary_entries_user_profile ON salary_entries(user_profile_id);
CREATE INDEX idx_salary_entries_date ON salary_entries(date_of_change);

-- Migrate data from salary_entries_backup
INSERT INTO salary_entries (
    user_id, company, position, salary_amount, 
    date_of_change, notes, bonus_amount, commission_amount,
    created_at, updated_at
)
SELECT 
    user_id, company, position, salary_amount,
    date_of_change, notes, COALESCE(bonus_amount, 0), COALESCE(commission_amount, 0),
    created_at, COALESCE(updated_at, created_at)
FROM salary_entries_backup;

-- Migrate data from salary_journal_backup
INSERT INTO salary_entries (
    user_id, company, position, salary_amount,
    date_of_change, notes, bonus_amount, commission_amount,
    created_at
)
SELECT 
    user_id, company, position, salary_amount,
    date_of_change, notes, COALESCE(bonus_amount, 0), COALESCE(commission_amount, 0),
    created_at
FROM salary_journal_backup
WHERE NOT EXISTS (
    SELECT 1 FROM salary_entries e 
    WHERE e.user_id = salary_journal_backup.user_id 
    AND e.date_of_change = salary_journal_backup.date_of_change
);

-- Drop backup tables
DROP TABLE IF EXISTS salary_entries_backup;
DROP TABLE IF EXISTS salary_journal_backup; 