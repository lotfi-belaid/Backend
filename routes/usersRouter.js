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
router.get('/by-role/:role', userController.getUsersByRole)
//update and delete
router.put('/:id', userController.updateUserById)
router.delete('/:id', userController.deleteUserById)
//search by name
router.get('/search', userController.search)
router.get('/searchByRentAmount', userController.searchByRentAmount)
router.get('/:id', userController.getUserById)

//admin endpoints
router.post('/admin/ban/:id', roleController.banUser)
router.post('/admin/approve/:id', roleController.approveUser)
router.get('/admin/dashboard', roleController.viewDashboard)

//owner endpoints
router.post('/owner/property', roleController.addProperty)
router.get('/owner/properties/:ownerId', roleController.getAllPropertyByOwner)
router.put('/owner/property', roleController.updateProperty)
router.post('/owner/unit', roleController.addUnit)
router.get('/units/:propertyId', roleController.getAllUnitByProperty)
router.put('/owner/unit/:unitId', roleController.updateUnitById)
router.get('/owner/payments', roleController.viewPayments)
router.post('/owner/assign-vendor', roleController.assignVendor)
router.post('/owner/approve-application', roleController.approveApplication);
router.post('/owner/review-termination', roleController.reviewLeaseTermination);

//tenant endpoints
router.post('/tenant/apply', roleController.applyForUnit)
router.post('/tenant/request-termination', roleController.requestLeaseTermination)
router.post('/tenant/signLease', roleController.signLease)
router.post('/tenant/pay-Invoice', roleController.payInvoice)
//vendor endpoints
router.post('/vendor/accept-job', roleController.acceptJob)
router.post('/vendor/add-report', roleController.addRepairReport)

router.delete('/owner/unit/:unitId',roleController.deleteUnit)
router.delete('/owner/property', roleController.deleteProperty)


module.exports = router;  