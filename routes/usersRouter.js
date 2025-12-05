// routes/usersRouter.js
const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const ownerController = require('../controllers/ownerController');
const tenantController = require('../controllers/tenantController');
const vendorController = require('../controllers/vendorController');
const userController = require('../controllers/userController');
const uploadfile = require('../middlewares/uploadfile');

/* ---------- AUTH / USER CREATION ---------- */

// create users with image upload
router.post(
    '/owners',
    uploadfile.single('image_User'),
    userController.createOwnerWithImg
);
router.post(
    '/tenants',
    uploadfile.single('image_User'),
    userController.createTenantWithImg
);
router.post(
    '/vendors',
    uploadfile.single('image_User'),
    userController.createVendorWithImg
);

// create admin (no image)
router.post('/admin', userController.createAdmin);

// login
router.post('/login', userController.loginUser);

/* ---------- ADMIN ROUTES ---------- */

router.post('/admin/ban/:id', adminController.banUser);
router.post('/admin/approve/:id', adminController.approveUser);
router.get('/admin/dashboard', adminController.viewDashboard);

/* ---------- OWNER ROUTES ---------- */

// properties
router.post('/owner/property', ownerController.addProperty);
router.get('/owner/properties/:ownerId', ownerController.getAllPropertyByOwner);
router.get('/owner/properties', ownerController.getAllPorperties);
router.put('/owner/property', ownerController.updateProperty);
router.delete('/owner/property', ownerController.deleteProperty);

// units
router.post('/owner/unit', ownerController.addUnit);
router.get('/owner/units/:propertyId', ownerController.getAllUnitByProperty);
router.get('/owner/units', ownerController.getAllUnits);
router.put('/owner/unit/:unitId', ownerController.updateUnitById);
router.delete('/owner/unit/:unitId', ownerController.deleteUnit);

// unit search (by rent amount)
router.get('/owner/units-search', ownerController.searchByRentAmount);

// applications / leases
router.post('/owner/approve-application', ownerController.approveApplication);
router.post('/owner/review-termination', ownerController.reviewLeaseTermination);

// payments & vendors
router.get('/owner/payments', ownerController.viewPayments);
router.post('/owner/assign-vendor', ownerController.assignVendor);

/* ---------- TENANT ROUTES ---------- */

router.post('/tenant/apply', tenantController.applyForUnit);
router.post('/tenant/sign-lease', tenantController.signLease);
router.post('/tenant/request-termination', tenantController.requestLeaseTermination);
router.post('/tenant/pay-invoice', tenantController.payInvoice);

/* ---------- VENDOR ROUTES ---------- */

router.post('/vendor/accept-job', vendorController.acceptJob);
router.post('/vendor/add-report', vendorController.addRepairReport);

/* ---------- GENERIC USER ROUTES ---------- */

// list & search users
router.get('/', userController.getAllUsers);
router.get('/by-role/:role', userController.getUsersByRole);
router.get('/search', userController.search); // (uses name from body; you can later change to query)

// update / delete must come BEFORE :id read if paths overlap
router.put('/:id', userController.updateUserById);
router.delete('/:id', userController.deleteUserById);

// get single user (keep LAST to avoid conflicts with above routes like /admin/..., /owner/...)
router.get('/:id', userController.getUserById);

module.exports = router;
