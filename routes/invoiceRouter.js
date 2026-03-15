const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoiceController");
const auth = require("../middlewares/authMiddleware");

// Base path: /invoices
router.get("/owner", auth, invoiceController.viewPayments);
router.post("/:id/pay", auth, invoiceController.payInvoice);
router.post("/:id/payment-intent", auth, invoiceController.createPaymentIntent);
router.post("/webhook", invoiceController.handleStripeWebhook);

module.exports = router;
