const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenantController');
const auth = require('../middlewares/authMiddleware');

// Apply for unit
router.post('/apply', auth, tenantController.applyForUnit);

// Sign lease
router.post('/sign-lease', auth, tenantController.signLease);

// Request lease termination
router.post('/request-termination', auth, tenantController.requestLeaseTermination);

// Pay invoice
router.post('/pay-invoice', auth, tenantController.payInvoice);

// Search units by rent amount (public route)
router.get('/units-search', tenantController.searchByRentAmount);

module.exports = router;
