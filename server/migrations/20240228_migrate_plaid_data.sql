-- Begin transaction
BEGIN;

-- Migrate transactions to new partitioned table
INSERT INTO transactions_new (
    id,
    user_id,
    plaid_transaction_id,
    plaid_item_id,
    account_id,
    amount,
    category,
    date,
    merchant_name,
    payment_channel,
    pending,
    status,
    metadata,
    created_at,
    updated_at
)
SELECT 
    t.id,
    t.user_id,
    t.plaid_transaction_id,
    pi.id as plaid_item_id,
    pa.id as account_id,
    t.amount,
    string_to_array(t.category, ',') as category,
    t.date,
    t.merchant_name,
    t.payment_channel,
    t.pending,
    COALESCE(t.status, 'active'),
    t.metadata,
    t.created_at,
    t.updated_at
FROM transactions t
LEFT JOIN plaid_items pi ON t.plaid_item_id = pi.plaid_item_id
LEFT JOIN plaid_accounts pa ON t.account_id = pa.plaid_account_id
WHERE t.source = 'plaid';

-- Verify data migration
DO $$
DECLARE
    old_count INTEGER;
    new_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO old_count FROM transactions WHERE source = 'plaid';
    SELECT COUNT(*) INTO new_count FROM transactions_new;
    
    IF old_count != new_count THEN
        RAISE EXCEPTION 'Data migration verification failed. Old count: %, New count: %', old_count, new_count;
    END IF;
END $$;

-- Create a backup of the old transactions table
ALTER TABLE transactions RENAME TO transactions_old;

-- Rename the new transactions table
ALTER TABLE transactions_new RENAME TO transactions;

-- Update sequences if needed
SELECT setval(pg_get_serial_sequence('transactions', 'id'), coalesce(max(id), 1), false) FROM transactions;

-- Refresh materialized view
REFRESH MATERIALIZED VIEW CONCURRENTLY account_balances_mv;

-- Commit transaction
COMMIT;

-- Analyze tables for query optimization
ANALYZE transactions;
ANALYZE plaid_items;
ANALYZE plaid_accounts;
ANALYZE balance_history;
ANALYZE webhook_events;
ANALYZE sync_events; 