const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const ManualAccountController = require('../controller/ManualAccountController');

// Protect all routes with authentication
router.use(authenticateToken);

// Create a new manual account
router.post('/', ManualAccountController.createManualAccount);

// Get all manual accounts for a user
router.get('/', ManualAccountController.getManualAccounts);

// Update a manual account
router.put('/:id', ManualAccountController.updateManualAccount);

// Delete a manual account
router.delete('/:id', ManualAccountController.deleteManualAccount);

module.exports = router; 