-- Alter the salary_entries table to add all the required columns
-- This script adds columns if they don't already exist

-- First check if the table exists and create it if not
CREATE TABLE IF NOT EXISTS salary_entries (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Now add all the columns we need if they don't exist
DO $$
BEGIN
    -- Add user_profile_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='salary_entries' AND column_name='user_profile_id') THEN
        ALTER TABLE salary_entries ADD COLUMN user_profile_id TEXT;
    END IF;

    -- Add company column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='salary_entries' AND column_name='company') THEN
        ALTER TABLE salary_entries ADD COLUMN company TEXT;
    END IF;

    -- Add position column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='salary_entries' AND column_name='position') THEN
        ALTER TABLE salary_entries ADD COLUMN position TEXT;
    END IF;

    -- Add salary_amount column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='salary_entries' AND column_name='salary_amount') THEN
        ALTER TABLE salary_entries ADD COLUMN salary_amount DECIMAL(15,2);
    END IF;

    -- Add pay_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='salary_entries' AND column_name='pay_type') THEN
        ALTER TABLE salary_entries ADD COLUMN pay_type TEXT;
    END IF;

    -- Add pay_frequency column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='salary_entries' AND column_name='pay_frequency') THEN
        ALTER TABLE salary_entries ADD COLUMN pay_frequency TEXT;
    END IF;

    -- Add hours_per_week column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='salary_entries' AND column_name='hours_per_week') THEN
        ALTER TABLE salary_entries ADD COLUMN hours_per_week DECIMAL(10,2);
    END IF;

    -- Add date column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='salary_entries' AND column_name='date') THEN
        ALTER TABLE salary_entries ADD COLUMN date DATE;
    END IF;

    -- Add notes column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='salary_entries' AND column_name='notes') THEN
        ALTER TABLE salary_entries ADD COLUMN notes TEXT;
    END IF;

    -- Add bonus_amount column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='salary_entries' AND column_name='bonus_amount') THEN
        ALTER TABLE salary_entries ADD COLUMN bonus_amount DECIMAL(15,2);
    END IF;

    -- Add bonus_is_percentage column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='salary_entries' AND column_name='bonus_is_percentage') THEN
        ALTER TABLE salary_entries ADD COLUMN bonus_is_percentage BOOLEAN DEFAULT FALSE;
    END IF;

    -- Add commission_amount column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='salary_entries' AND column_name='commission_amount') THEN
        ALTER TABLE salary_entries ADD COLUMN commission_amount DECIMAL(15,2);
    END IF;

    -- Add health_insurance column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='salary_entries' AND column_name='health_insurance') THEN
        ALTER TABLE salary_entries ADD COLUMN health_insurance DECIMAL(15,2);
    END IF;

    -- Add dental_insurance column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='salary_entries' AND column_name='dental_insurance') THEN
        ALTER TABLE salary_entries ADD COLUMN dental_insurance DECIMAL(15,2);
    END IF;

    -- Add vision_insurance column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='salary_entries' AND column_name='vision_insurance') THEN
        ALTER TABLE salary_entries ADD COLUMN vision_insurance DECIMAL(15,2);
    END IF;

    -- Add retirement_401k column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='salary_entries' AND column_name='retirement_401k') THEN
        ALTER TABLE salary_entries ADD COLUMN retirement_401k DECIMAL(15,2);
    END IF;

    -- Add state column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='salary_entries' AND column_name='state') THEN
        ALTER TABLE salary_entries ADD COLUMN state TEXT;
    END IF;

    -- Add city column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='salary_entries' AND column_name='city') THEN
        ALTER TABLE salary_entries ADD COLUMN city TEXT;
    END IF;

    -- Check for existing amount column and handle compatibility with new schema
    IF EXISTS (SELECT 1 FROM information_schema.columns 
              WHERE table_name='salary_entries' AND column_name='amount') THEN
        -- If both amount and salary_amount exist, we'll create a trigger to sync them
        -- This is for backward compatibility
        CREATE OR REPLACE FUNCTION sync_salary_amount()
        RETURNS TRIGGER AS $$
        BEGIN
            IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
                -- If salary_amount is set, sync to amount
                IF NEW.salary_amount IS NOT NULL THEN
                    NEW.amount := NEW.salary_amount;
                -- If amount is set but salary_amount is not, sync to salary_amount
                ELSIF NEW.amount IS NOT NULL THEN
                    NEW.salary_amount := NEW.amount;
                END IF;
            END IF;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- Check if trigger already exists
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'sync_salary_fields') THEN
            CREATE TRIGGER sync_salary_fields
            BEFORE INSERT OR UPDATE ON salary_entries
            FOR EACH ROW
            EXECUTE FUNCTION sync_salary_amount();
        END IF;
    END IF;

    -- Similarly check for description/notes compatibility
    IF EXISTS (SELECT 1 FROM information_schema.columns 
              WHERE table_name='salary_entries' AND column_name='description') THEN
        -- Add a similar trigger for description and notes
        CREATE OR REPLACE FUNCTION sync_notes_description()
        RETURNS TRIGGER AS $$
        BEGIN
            IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
                -- If notes is set, sync to description
                IF NEW.notes IS NOT NULL THEN
                    NEW.description := NEW.notes;
                -- If description is set but notes is not, sync to notes
                ELSIF NEW.description IS NOT NULL THEN
                    NEW.notes := NEW.description;
                END IF;
            END IF;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- Check if trigger already exists
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'sync_notes_fields') THEN
            CREATE TRIGGER sync_notes_fields
            BEFORE INSERT OR UPDATE ON salary_entries
            FOR EACH ROW
            EXECUTE FUNCTION sync_notes_description();
        END IF;
    END IF;
END $$; 