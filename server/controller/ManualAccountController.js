const ManualAccountModel = require('../models/ManualAccountModel');

// Create a new manual account
const createManualAccount = async (req, res) => {
    try {
        const userId = req.user.userId;
        const accountData = req.body;

        // Validate required fields
        const requiredFields = ['name', 'type', 'category', 'subcategory', 'balance'];
        const missingFields = requiredFields.filter(field => !accountData[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                message: 'Missing required fields',
                missingFields
            });
        }

        // Validate numeric fields
        if (isNaN(parseFloat(accountData.balance))) {
            return res.status(400).json({
                message: 'Invalid balance value'
            });
        }

        // Create the account
        const account = await ManualAccountModel.addManualAccount(userId, {
            ...accountData,
            balance: parseFloat(accountData.balance)
        });

        res.status(201).json(account);
    } catch (error) {
        console.error('Error creating manual account:', error);
        res.status(500).json({
            message: 'Error creating manual account',
            error: error.message
        });
    }
};

// Get all manual accounts for a user
const getManualAccounts = async (req, res) => {
    try {
        const userId = req.user.userId;
        const accounts = await ManualAccountModel.getManualAccounts(userId);
        
        // Group accounts by category
        const groupedAccounts = accounts.reduce((acc, account) => {
            const category = account.category.toLowerCase();
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(account);
            return acc;
        }, {});

        res.json(groupedAccounts);
    } catch (error) {
        console.error('Error fetching manual accounts:', error);
        res.status(500).json({
            message: 'Error fetching manual accounts',
            error: error.message
        });
    }
};

// Update a manual account
const updateManualAccount = async (req, res) => {
    try {
        const userId = req.user.userId;
        const accountId = req.params.id;
        const accountData = req.body;

        // Validate required fields
        const requiredFields = ['name', 'type', 'category', 'subcategory', 'balance'];
        const missingFields = requiredFields.filter(field => !accountData[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                message: 'Missing required fields',
                missingFields
            });
        }

        // Validate numeric fields
        if (isNaN(parseFloat(accountData.balance))) {
            return res.status(400).json({
                message: 'Invalid balance value'
            });
        }

        // Update the account
        const account = await ManualAccountModel.updateManualAccount(accountId, userId, {
            ...accountData,
            balance: parseFloat(accountData.balance)
        });

        if (!account) {
            return res.status(404).json({
                message: 'Account not found or unauthorized'
            });
        }

        res.json(account);
    } catch (error) {
        console.error('Error updating manual account:', error);
        res.status(500).json({
            message: 'Error updating manual account',
            error: error.message
        });
    }
};

// Delete a manual account
const deleteManualAccount = async (req, res) => {
    try {
        const userId = req.user.userId;
        const accountId = req.params.id;

        const account = await ManualAccountModel.deleteManualAccount(accountId, userId);

        if (!account) {
            return res.status(404).json({
                message: 'Account not found or unauthorized'
            });
        }

        res.json({
            message: 'Account deleted successfully',
            account
        });
    } catch (error) {
        console.error('Error deleting manual account:', error);
        res.status(500).json({
            message: 'Error deleting manual account',
            error: error.message
        });
    }
};

module.exports = {
    createManualAccount,
    getManualAccounts,
    updateManualAccount,
    deleteManualAccount
}; 