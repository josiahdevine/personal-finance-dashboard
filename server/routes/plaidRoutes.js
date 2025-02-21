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

// Sync balances
router.post('/sync-balances', async (req, res) => {
    try {
        const userId = req.user.id;
        const items = await PlaidModel.getPlaidItemsByUserId(userId);
        const allBalances = [];

        for (const item of items) {
            try {
                const response = await plaidClient.accountsBalanceGet({
                    access_token: item.plaid_access_token
                });

                // Record each account's balance in history
                for (const account of response.data.accounts) {
                    const balance = account.balances.current;
                    const isLiability = account.type.toLowerCase().includes('credit') || 
                                      account.type.toLowerCase().includes('loan');
                    
                    await PlaidModel.recordBalanceHistory(
                        userId,
                        account.type,
                        account.account_id,
                        balance,
                        isLiability,
                        'plaid',
                        {
                            institution_name: item.institution_name,
                            account_name: account.name,
                            subtype: account.subtype
                        }
                    );

                    allBalances.push({
                        account_id: account.account_id,
                        account_name: account.name,
                        account_type: account.type,
                        current_balance: balance,
                        institution_name: item.institution_name
                    });
                }
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