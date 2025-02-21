const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const SalaryJournalController = require('../controller/SalaryJournalController');

// Protect all routes with authentication
router.use(authenticateToken);

// Define route handlers
router.post('/salary-entries', SalaryJournalController.createSalaryEntry);
router.get('/salary-entries', SalaryJournalController.getSalaryJournal);
router.put('/salary-entries/:id', SalaryJournalController.updateSalaryEntry);
router.delete('/salary-entries/:id', SalaryJournalController.deleteSalaryEntry);

module.exports = router;