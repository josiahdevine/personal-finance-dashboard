const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const StockController = require('../controller/StockController');

// Protect all routes with authentication
router.use(authenticateToken);

// Get current price for a stock symbol
router.get('/price/:symbol', StockController.getStockPrice);

// Update all stock prices for a user's accounts
router.post('/update-prices', StockController.updateAllStockPrices);

module.exports = router; 