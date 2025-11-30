var express = require('express');
var router = express.Router();
const userController = require('../controllers/userController')
const roleController = require('../controllers/roleController')
const uploadfile = require('../middlewares/uploadfile');

router.post('/owners', uploadfile.single('image_User'), userController.createOwnerWithImg);
router.post('/tenants', uploadfile.single('image_User'), userController.createTenantWithImg);
router.post('/vendors', uploadfile.single('image_User'), userController.createVendorWithImg);
//create user
router.post('/admin', userController.createAdmin)
router.post('/owner', userController.createOwnerWithImg)
router.post('/tenant', userController.createTenantWithImg)
router.post('/vendor', userController.createVendorWithImg)
//login user
router.post('/login', userController.loginUser)
//get users
router.get('/', userController.getAllUsers)
router.get('/:id', userController.getUserById)
router.get('/by-role/:role', userController.getUsersByRole)
//update and delete
router.put('/:id', userController.updateUserById)
router.delete('/:id', userController.deleteUserById)
//search by name
router.get('/search', userController.search)

//admin endpoints
router.post('/admin/ban/:id',roleController.banUser)
router.post('/admin/approve/:id',roleController.approveUser)
router.get('/admin/dashboard',roleController.viewDashboard)

//owner endpoints
router.post('/owner/property',roleController.addProperty)
router.put('/owner/property',roleController.updateProperty)
router.delete('/owner/property',roleController.deleteProperty)
router.post







module.exports = router;  