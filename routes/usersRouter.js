var express = require('express');
var router = express.Router();
const userController = require('../controllers/userController')
router.post('/admins', userController.createAdmin);
router.post('/owners', userController.createOwner);
router.post('/tenants', userController.createTenant);
router.post('/vendors', userController.createVendor);
router.get('/getAllUsers', userController.getAllUsers);
router.get('/getUserById/:id', userController.getUserById);
router.put('/updateUserById/:id', userController.updateUserById);
router.delete('/deleteUserById/:id', userController.deleteUserById);



module.exports = router;  