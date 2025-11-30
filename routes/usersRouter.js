var express = require('express');
var router = express.Router();
const userController = require('../controllers/userController')
const uploadfile = require('../middlewares/uploadfile');
router.post('/admins', userController.createAdmin);
router.post('/owners', uploadfile.single('image_User'), userController.createOwnerWithImg);
router.post('/tenants', uploadfile.single('image_User'), userController.createTenantWithImg);
router.post('/vendors', uploadfile.single('image_User'), userController.createVendorWithImg);
router.get('/getAllUsers', userController.getAllUsers);
router.get('/getUserById/:id', userController.getUserById);
router.put('/updateUserById/:id', userController.updateUserById);
router.delete('/deleteUserById/:id', userController.deleteUserById);




module.exports = router;  