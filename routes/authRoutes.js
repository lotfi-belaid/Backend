const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const uploadfile = require('../middlewares/uploadfile');
const { validateCreateUser, validateLogin } = require('../validators');

// Create users with image upload
router.post(
    '/owners',
    uploadfile.single('image_User'),
    validateCreateUser,
    userController.createOwnerWithImg
);

router.post(
    '/tenants',
    uploadfile.single('image_User'),
    validateCreateUser,
    userController.createTenantWithImg
);

router.post(
    '/vendors',
    uploadfile.single('image_User'),
    validateCreateUser,
    userController.createVendorWithImg
);

// Create admin (no image)
router.post('/admin', validateCreateUser, userController.createAdmin);

// Login
router.post('/login', validateLogin, userController.loginUser);

module.exports = router;
