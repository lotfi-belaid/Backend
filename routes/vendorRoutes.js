const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const auth = require('../middlewares/authMiddleware');

// All vendor routes require authentication
router.use(auth);

// Accept maintenance job
router.post('/accept-job', vendorController.acceptJob);

// Submit repair report
router.post('/add-report', vendorController.addRepairReport);

module.exports = router;
