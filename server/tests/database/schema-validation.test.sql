-- Schema Validation Test Script

-- Function to log test results
CREATE OR REPLACE FUNCTION test_log(test_name TEXT, result BOOLEAN, details TEXT DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
    IF result THEN
        RAISE NOTICE 'Test "%": PASS', test_name;
    ELSE
        RAISE WARNING 'Test "%": FAIL - %', test_name, COALESCE(details, 'no details');
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Begin tests
DO $$
DECLARE
    table_count INT;
    invalid_fks TEXT[];
    missing_indices TEXT[];
    table_record RECORD;
    partition_record RECORD;
    mv_record RECORD;
BEGIN
    RAISE NOTICE 'Starting schema validation tests...';
    
    -- Test 1: Required tables exist
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN (
        'plaid_items',
        'plaid_accounts',
        'transactions',
        'balance_history',
        'webhook_events',
        'sync_events'
    );
    
    PERFORM test_log(
        'Required tables exist',
        table_count = 6,
        CASE WHEN table_count < 6 THEN 'Missing required tables' ELSE NULL END
    );

    -- Test 2: Primary key validation
    WITH pk_check AS (
        SELECT t.table_name
        FROM information_schema.tables t
        LEFT JOIN information_schema.table_constraints tc 
        ON t.table_name = tc.table_name 
        AND tc.constraint_type = 'PRIMARY KEY'
        WHERE t.table_schema = 'public'
        AND t.table_type = 'BASE TABLE'
        AND tc.constraint_name IS NULL
    )
    SELECT array_agg(table_name) INTO invalid_fks 
    FROM pk_check;
    
    PERFORM test_log(
        'All tables have primary keys',
        invalid_fks IS NULL,
        CASE WHEN invalid_fks IS NOT NULL 
        THEN 'Tables missing primary keys: ' || array_to_string(invalid_fks, ', ')
        ELSE NULL END
    );

    -- Test 3: Foreign key validation
    WITH fk_check AS (
        SELECT 
            tc.table_name,
            kcu.column_name
        FROM information_schema.tables t
        LEFT JOIN information_schema.table_constraints tc 
        ON t.table_name = tc.table_name
        LEFT JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        WHERE t.table_schema = 'public'
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name IN ('user_id', 'plaid_item_id', 'account_id')
        AND tc.constraint_name IS NULL
    )
    SELECT array_agg(table_name || '.' || column_name) INTO invalid_fks 
    FROM fk_check;
    
    PERFORM test_log(
        'Required foreign keys exist',
        invalid_fks IS NULL,
        CASE WHEN invalid_fks IS NOT NULL 
        THEN 'Missing foreign keys: ' || array_to_string(invalid_fks, ', ')
        ELSE NULL END
    );

    -- Test 4: Required indices exist
    WITH required_indices AS (
        SELECT table_name, index_name
        FROM (
            VALUES 
                ('plaid_items', 'idx_plaid_items_user_id'),
                ('plaid_items', 'idx_plaid_items_status'),
                ('plaid_accounts', 'idx_plaid_accounts_user_id'),
                ('plaid_accounts', 'idx_plaid_accounts_item_id'),
                ('transactions', 'idx_transactions_new_user_id'),
                ('transactions', 'idx_transactions_new_account'),
                ('balance_history', 'idx_balance_history_user_account'),
                ('webhook_events', 'idx_webhook_events_item')
        ) AS required(table_name, index_name)
        EXCEPT
        SELECT 
            tablename::text,
            indexname::text
        FROM pg_indexes 
        WHERE schemaname = 'public'
    )
    SELECT array_agg(table_name || '.' || index_name) INTO missing_indices 
    FROM required_indices;
    
    PERFORM test_log(
        'Required indices exist',
        missing_indices IS NULL,
        CASE WHEN missing_indices IS NOT NULL 
        THEN 'Missing indices: ' || array_to_string(missing_indices, ', ')
        ELSE NULL END
    );

    -- Test 5: Table partitioning
    SELECT EXISTS (
        SELECT 1
        FROM pg_partitioned_table pt
        JOIN pg_class pc ON pt.partrelid = pc.oid
        WHERE pc.relname = 'transactions'
    ) INTO STRICT partition_record;
    
    PERFORM test_log(
        'Transactions table is partitioned',
        partition_record.exists,
        CASE WHEN NOT partition_record.exists 
        THEN 'Transactions table is not partitioned'
        ELSE NULL END
    );

    -- Test 6: Materialized view
    SELECT EXISTS (
        SELECT 1
        FROM pg_matviews
        WHERE matviewname = 'account_balances_mv'
    ) INTO STRICT mv_record;
    
    PERFORM test_log(
        'Account balances materialized view exists',
        mv_record.exists,
        CASE WHEN NOT mv_record.exists 
        THEN 'Account balances materialized view is missing'
        ELSE NULL END
    );

    -- Test 7: Column constraints
    FOR table_record IN (
        SELECT table_name, column_name, is_nullable, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name IN (
            'plaid_items',
            'plaid_accounts',
            'transactions',
            'balance_history',
            'webhook_events',
            'sync_events'
        )
        AND (
            (column_name = 'user_id' AND (is_nullable = 'YES' OR data_type != 'uuid')) OR
            (column_name = 'created_at' AND is_nullable = 'YES') OR
            (column_name = 'status' AND is_nullable = 'YES')
        )
    ) LOOP
        PERFORM test_log(
            'Column constraints for ' || table_record.table_name || '.' || table_record.column_name,
            FALSE,
            'Invalid constraints: is_nullable=' || table_record.is_nullable || 
            ', data_type=' || table_record.data_type
        );
    END LOOP;

    -- Test 8: Trigger existence
    SELECT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'refresh_account_balances_mv_trigger'
    ) INTO STRICT table_record;
    
    PERFORM test_log(
        'Balance refresh trigger exists',
        table_record.exists,
        CASE WHEN NOT table_record.exists 
        THEN 'Balance refresh trigger is missing'
        ELSE NULL END
    );

    RAISE NOTICE 'Schema validation tests completed.';
END $$; 