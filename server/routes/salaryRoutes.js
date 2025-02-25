const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const SalaryController = require('../controllers/SalaryController');

// Protect all routes
router.use(authenticateToken);

// Get monthly salary summary
router.get('/monthly-summary', SalaryController.getMonthlySummary);

// Get all salary entries
router.get('/entries', SalaryController.getSalaryEntries);

// Add salary entry
router.post('/', SalaryController.addSalaryEntry);

// Update salary entry
router.put('/:id', SalaryController.updateSalaryEntry);

// Delete salary entry
router.delete('/:id', SalaryController.deleteSalaryEntry);

module.exports = router;