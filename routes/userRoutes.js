const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// List all users
router.get('/', userController.getAllUsers);

// Get users by role
router.get('/by-role/:role', userController.getUsersByRole);

// Search users by name
router.get('/search', userController.search);

// Update user
router.put('/:id', userController.updateUserById);

// Delete user
router.delete('/:id', userController.deleteUserById);

// Get single user (keep LAST to avoid conflicts)
router.get('/:id', userController.getUserById);

module.exports = router;
