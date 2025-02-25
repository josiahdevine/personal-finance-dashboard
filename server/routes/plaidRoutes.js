const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const PlaidController = require('../controller/PlaidController');
const PlaidModel = require('../models/PlaidModel');
const ManualAccountModel = require('../models/ManualAccountModel');
const plaidClient = require('../plaid');

// Protect all routes with authentication
router.use(authenticateToken);

// Create link token
router.post('/create-link-token', PlaidController.createLinkToken);

// Exchange public token
router.post('/exchange-token', PlaidController.exchangePublicToken);

// Get accounts
router.get('/accounts', PlaidController.getAccounts);

// Get balance history
router.get('/balance-history', PlaidController.getBalanceHistory);

// Sync balances
router.post('/sync-balances', async (req, res) => {
    try {
        const userId = req.user.id;
        const items = await PlaidModel.getPlaidItemsByUserId(userId);
        const allBalances = [];

        const BATCH_SIZE = 50;

        const processBatchedAccounts = async (accounts, userId) => {
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
                await processBatchedAccounts(response.data.accounts, userId);

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

// Add new endpoint to get balance history
router.get('/balance-history', async (req, res) => {
    try {
        const userId = req.user.id;
        const { startDate, endDate } = req.query;
        
        // Default to last year if no dates provided
        const end = endDate ? new Date(endDate) : new Date();
        const start = startDate ? new Date(startDate) : new Date(end);
        start.setFullYear(start.getFullYear() - 1);

        const history = await PlaidModel.getBalanceHistory(userId, start, end);
        res.json({ history });
    } catch (error) {
        console.error('Error fetching balance history:', error);
        res.status(500).json({ error: 'Failed to fetch balance history' });
    }
});

module.exports = router;