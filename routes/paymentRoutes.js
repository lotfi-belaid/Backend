const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const auth = require('../middlewares/authMiddleware');

// Create payment intent (requires auth)
router.post('/create-intent', auth, paymentController.createPaymentIntent);

// Stripe webhook (no auth - Stripe verifies via signature)
router.post('/webhook', paymentController.handleStripeWebhook);

module.exports = router;
