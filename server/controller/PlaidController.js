const PlaidModel = require('../models/PlaidModel');

// Create a link token
const createLinkToken = async (req, res) => {
    try {
        const userId = req.user.userId;
        console.log('Creating link token for user:', userId);
        
        const plaidClient = req.app.locals.plaidClient;
        if (!plaidClient) {
            console.error('Plaid client not initialized');
            return res.status(500).json({ error: 'Plaid client not initialized' });
        }

        const request = {
            user: { client_user_id: userId.toString() },
            client_name: 'Personal Finance Dashboard',
            products: ['auth', 'transactions'],
            country_codes: ['US'],
            language: 'en'
        };

        console.log('Link token request:', request);
        
        try {
            const response = await plaidClient.linkTokenCreate(request);
            console.log('Link token created successfully:', response.data);
            res.json(response.data);
        } catch (plaidError) {
            console.error('Plaid API error:', plaidError.response?.data || plaidError);
            if (plaidError.code === 'EAI_AGAIN' || plaidError.code === 'ECONNREFUSED') {
                return res.status(503).json({ 
                    error: 'Network connectivity issue with Plaid. Please try again in a few moments.',
                    details: plaidError.message 
                });
            }
            throw plaidError;
        }
    } catch (error) {
        console.error('Error creating link token:', error);
        console.error('Error details:', error.response?.data);
        res.status(500).json({ 
            error: error.message,
            details: error.response?.data 
        });
    }
};

// Exchange public token for access token
const exchangePublicToken = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { public_token, institution } = req.body;
        const plaidClient = req.app.locals.plaidClient;

        if (!plaidClient) {
            console.error('Plaid client not initialized');
            return res.status(500).json({ error: 'Plaid client not initialized' });
        }

        const exchangeResponse = await plaidClient.itemPublicTokenExchange({
            public_token: public_token
        });

        const accessToken = exchangeResponse.data.access_token;
        const itemId = exchangeResponse.data.item_id;

        // Store the item in our database
        await PlaidModel.storePlaidItem(
            userId,
            itemId,
            accessToken,
            institution.institution_id,
            institution.name
        );

        // Get accounts
        const accountsResponse = await plaidClient.accountsGet({
            access_token: accessToken
        });

        // Store accounts
        const accounts = await PlaidModel.storePlaidAccounts(
            accountsResponse.data.accounts,
            itemId
        );

        // Store initial balances
        await PlaidModel.storeAccountBalances(
            accountsResponse.data.accounts.map(account => ({
                account_id: account.account_id,
                current: account.balances.current,
                available: account.balances.available,
                limit: account.balances.limit,
                iso_currency_code: account.balances.iso_currency_code,
                unofficial_currency_code: account.balances.unofficial_currency_code
            }))
        );

        res.json({
            message: 'Account successfully connected',
            accounts: accounts
        });
    } catch (error) {
        console.error('Error exchanging public token:', error);
        console.error('Error details:', error.response?.data);
        res.status(500).json({ 
            error: error.message,
            details: error.response?.data 
        });
    }
};

// Get accounts for a user
const getAccounts = async (req, res) => {
    try {
        const userId = req.user.userId;
        console.log('Getting accounts for user:', userId);
        
        // Get all Plaid items for the user
        const items = await PlaidModel.getPlaidItemsByUserId(userId);
        console.log('Found items:', items.length);
        
        // Get latest balances for all accounts
        const balances = await PlaidModel.getLatestBalances(userId);
        console.log('Found balances:', balances.length);

        res.json({
            items: items,
            balances: balances
        });
    } catch (error) {
        console.error('Error getting accounts:', error);
        res.status(500).json({ error: error.message });
    }
};

// Sync account balances
const syncBalances = async (req, res) => {
    try {
        const userId = req.user.userId;
        const plaidClient = req.app.locals.plaidClient;

        if (!plaidClient) {
            console.error('Plaid client not initialized');
            return res.status(500).json({ error: 'Plaid client not initialized' });
        }

        const items = await PlaidModel.getPlaidItemsByUserId(userId);
        console.log(`Syncing balances for ${items.length} items`);

        for (const item of items) {
            const accountsResponse = await plaidClient.accountsGet({
                access_token: item.plaid_access_token
            });

            await PlaidModel.storeAccountBalances(
                accountsResponse.data.accounts.map(account => ({
                    account_id: account.account_id,
                    current: account.balances.current,
                    available: account.balances.available,
                    limit: account.balances.limit,
                    iso_currency_code: account.balances.iso_currency_code,
                    unofficial_currency_code: account.balances.unofficial_currency_code
                }))
            );
        }

        const balances = await PlaidModel.getLatestBalances(userId);
        res.json({ balances });
    } catch (error) {
        console.error('Error syncing balances:', error);
        console.error('Error details:', error.response?.data);
        res.status(500).json({ 
            error: error.message,
            details: error.response?.data 
        });
    }
};

module.exports = {
    createLinkToken,
    exchangePublicToken,
    getAccounts,
    syncBalances
}; 