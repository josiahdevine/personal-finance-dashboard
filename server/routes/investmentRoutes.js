const express = require('express');
const router = express.Router();
const InvestmentController = require('../controllers/InvestmentController');
const { authenticateToken } = require('../middleware/auth');

// Protect all routes
router.use(authenticateToken);

// Create a new investment
router.post('/', InvestmentController.createInvestment);

// Update investment quantity
router.put('/:investment_id/quantity', InvestmentController.updateQuantity);

// Get investment details
router.get('/:investment_id', InvestmentController.getInvestmentDetails);

// Get all investments for a user
router.get('/', InvestmentController.getUserInvestments);

// Calculate investment performance
router.get('/:investment_id/performance', InvestmentController.getPerformance);

// Update prices for all investments
router.post('/update-prices', InvestmentController.updatePrices);

// Get price history for an investment
router.get('/:investment_id/price-history', InvestmentController.getPriceHistory);

module.exports = router; 