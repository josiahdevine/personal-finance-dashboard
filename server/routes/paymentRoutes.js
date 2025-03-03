const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const PaymentController = require('../controllers/PaymentController');

// Parse raw body for webhook
const parseRawBody = (req, res, next) => {
  if (req.originalUrl === '/api/payments/webhook') {
    let data = '';
    req.setEncoding('utf8');
    
    req.on('data', (chunk) => {
      data += chunk;
    });
    
    req.on('end', () => {
      req.rawBody = data;
      next();
    });
  } else {
    next();
  }
};

// All routes except webhook require authentication
router.post('/create-payment-intent', authenticateToken, PaymentController.createPaymentIntent);
router.post('/create-subscription', authenticateToken, PaymentController.createSubscription);
router.get('/payment-methods', authenticateToken, PaymentController.getPaymentMethods);
router.post('/add-payment-method', authenticateToken, PaymentController.addPaymentMethod);
router.delete('/payment-methods/:paymentMethodId', authenticateToken, PaymentController.removePaymentMethod);
router.get('/subscription', authenticateToken, PaymentController.getSubscriptionDetails);
router.post('/cancel-subscription', authenticateToken, PaymentController.cancelSubscription);

// Webhook doesn't need authentication, but needs raw body
router.post('/webhook', parseRawBody, PaymentController.handleWebhook);

module.exports = router; 