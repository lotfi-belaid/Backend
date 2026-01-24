const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middlewares/authMiddleware');

// All admin routes require authentication
router.use(auth);

// Ban user
router.post('/ban/:id', adminController.banUser);

// Approve pending user
router.post('/approve/:id', adminController.approveUser);

// View dashboard statistics
router.get('/dashboard', adminController.viewDashboard);

module.exports = router;
