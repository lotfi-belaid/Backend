const express = require("express");
const router = express.Router();

const paymentController = require("../controllers/paymentController");
const auth = require("../middlewares/authMiddleware");

router.post("/payment/create-intent", auth, paymentController.createPaymentIntent);
router.post("/webhook", paymentController.handleStripeWebhook);

module.exports = router;
