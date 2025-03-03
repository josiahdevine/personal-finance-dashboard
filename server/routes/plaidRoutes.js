const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const PlaidController = require('../controller/PlaidController');
const PlaidModel = require('../models/PlaidModel');
const ManualAccountModel = require('../models/ManualAccountModel');
const { plaidClient } = require('../plaid');

// Protect all routes with authentication
router.use(authenticateToken);

// Create link token
router.post('/create-link-token', PlaidController.createLinkToken);

// Exchange public token
router.post('/exchange-token', PlaidController.exchangePublicToken);

// Get accounts
router.get('/accounts', PlaidController.getAccounts);

// Get transactions
router.get('/transactions', PlaidController.getTransactions);

// Get balance history
router.get('/balance-history', PlaidController.getBalanceHistory);

// Check Plaid connection status
router.get('/status', PlaidController.getStatus);

// Sync balances
router.post('/sync-balances', async (req, res) => {
    try {
        const userId = req.user.id;
        const items = await PlaidModel.getPlaidItemsByUserId(userId);
        const allBalances = [];

        const BATCH_SIZE = 50;

        const processBatchedAccounts = async (accounts, userId, item) => {
            for (let i = 0; i < accounts.length; i += BATCH_SIZE) {
                const batch = accounts.slice(i, i + BATCH_SIZE);
                await Promise.all(batch.map(account => 
                    PlaidModel.recordBalanceHistory(
                        userId,
                        account.type,
                        account.account_id,
                        account.balances.current,
                        account.type.toLowerCase().includes('credit') || 
                        account.type.toLowerCase().includes('loan'),
                        'plaid',
                        {
                            institution_name: item.institution_name,
                            account_name: account.name,
                            subtype: account.subtype
                        }
                    )
                ));
                // Add small delay between batches
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        };

        for (const item of items) {
            try {
                const response = await plaidClient.accountsBalanceGet({
                    access_token: item.plaid_access_token
                });

                // Record each account's balance in history
                await processBatchedAccounts(response.data.accounts, userId, item);

                response.data.accounts.forEach(account => {
                    allBalances.push({
                        account_id: account.account_id,
                        account_name: account.name,
                        account_type: account.type,
                        current_balance: account.balances.current,
                        institution_name: item.institution_name
                    });
                });
            } catch (error) {
                console.error(`Error fetching balances for item ${item.plaid_item_id}:`, error);
            }
        }

        // Get manual accounts and record their balances
        const manualAccounts = await ManualAccountModel.getManualAccounts(userId);
        
        for (const account of manualAccounts.assets) {
            await PlaidModel.recordBalanceHistory(
                userId,
                account.type,
                `manual_${account.id}`,
                account.balance,
                false,
                'manual',
                {
                    account_name: account.name,
                    category: 'asset'
                }
            );
            allBalances.push({
                account_id: `manual_${account.id}`,
                account_name: account.name,
                account_type: account.type,
                current_balance: account.balance,
                institution_name: 'Manual Entry'
            });
        }

        for (const account of manualAccounts.liabilities) {
            await PlaidModel.recordBalanceHistory(
                userId,
                account.type,
                `manual_${account.id}`,
                account.balance,
                true,
                'manual',
                {
                    account_name: account.name,
                    category: 'liability'
                }
            );
            allBalances.push({
                account_id: `manual_${account.id}`,
                account_name: account.name,
                account_type: account.type,
                current_balance: account.balance,
                institution_name: 'Manual Entry'
            });
        }

        res.json({ balances: allBalances });
    } catch (error) {
        console.error('Error syncing balances:', error);
        res.status(500).json({ error: 'Failed to sync balances' });
    }
});

// Webhook endpoint (no authentication required for this endpoint)
router.use('/webhooks', express.raw({ type: 'application/json' }));
router.post('/webhooks', async (req, res) => {
    try {
        // For security, you should verify the webhook
        /* uncomment in production:
        const { plaid_signature } = req.headers;

        // Verify the webhook signature
        // See https://plaid.com/docs/api/webhooks/#webhook-verification
        try {
            plaidClient.webhookVerify({
                webhook_type: 'TRANSACTIONS',
                webhook_code: 'DEFAULT_UPDATE',
                item_id: 'abc123',
                request_body: JSON.stringify(req.body),
                webhook_signature: plaid_signature
            });
        } catch (err) {
            return res.status(401).json({ error: 'Invalid webhook signature' });
        }
        */

        const webhookType = req.body.webhook_type;
        const webhookCode = req.body.webhook_code;
        const itemId = req.body.item_id;

        console.log(`Received webhook: ${webhookType} / ${webhookCode} for item ${itemId}`);
        
        // Store webhook in database for audit
        // await PlaidModel.storeWebhook(webhookType, webhookCode, itemId, req.body);

        // Handle different webhook types
        switch (webhookType) {
            case 'TRANSACTIONS':
                // Handle transaction webhooks
                // You might want to start a background job to fetch new transactions
                console.log('Transaction webhook received');
                break;
            
            case 'ITEM':
                // Handle item webhooks (e.g., error, pending expiration)
                console.log('Item webhook received');
                break;
            
            default:
                console.log(`Unhandled webhook type: ${webhookType}`);
        }

        // Acknowledge receipt of webhook
        res.status(200).json({ received: true });
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).json({ error: 'Error processing webhook' });
    }
});

module.exports = router;