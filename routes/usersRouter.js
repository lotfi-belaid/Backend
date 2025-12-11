// routes/usersRouter.js
const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const ownerController = require('../controllers/ownerController');
const tenantController = require('../controllers/tenantController');
const vendorController = require('../controllers/vendorController');
const userController = require('../controllers/userController');
const paymentController=require('../controllers/paymentController');
const uploadfile = require('../middlewares/uploadfile');
const auth=require('../middlewares/authMiddleware');

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

router.post('/admin/ban/:id', auth, adminController.banUser);
router.post('/admin/approve/:id', auth, adminController.approveUser);
router.get('/admin/dashboard', auth, adminController.viewDashboard);

/* ---------- OWNER ROUTES ---------- */

// properties
router.post('/owner/property', auth, ownerController.addProperty);
router.get('/owner/properties/:ownerId', auth, ownerController.getAllPropertyByOwner);
router.get('/owner/properties', auth, ownerController.getAllPorperties);
router.put('/owner/property', auth, ownerController.updateProperty);
router.delete('/owner/property', auth, ownerController.deleteProperty);

// units
router.post('/owner/unit', auth, ownerController.addUnit);
router.get('/owner/units/:propertyId', auth, ownerController.getAllUnitByProperty);
router.get('/owner/units', auth, ownerController.getAllUnits);
router.put('/owner/unit/:unitId', auth, ownerController.updateUnitById);
router.delete('/owner/unit/:unitId', auth, ownerController.deleteUnit);


// applications / leases
router.post('/owner/approve-application', auth, ownerController.approveApplication);
router.post('/owner/review-termination', auth, ownerController.reviewLeaseTermination);

// payments & vendors
router.get('/owner/payments', auth, ownerController.viewPayments);
router.post('/owner/assign-vendor', auth, ownerController.assignVendor);

/* ---------- TENANT ROUTES ---------- */

router.post('/tenant/apply', auth, tenantController.applyForUnit);
router.post('/tenant/sign-lease', auth, tenantController.signLease);
router.post('/tenant/request-termination', auth, tenantController.requestLeaseTermination);
router.post('/tenant/pay-invoice', auth, tenantController.payInvoice);

// unit search
router.get('/tenant/units-search', tenantController.searchByRentAmount);
/* ---------- VENDOR ROUTES ---------- */

router.post('/vendor/accept-job', auth, vendorController.acceptJob);
router.post('/vendor/add-report', auth, vendorController.addRepairReport);


/* ---------- PAYMENT ROUTES ---------- */
router.post(
    '/payment/create-intent', auth, paymentController.createPaymentIntent);
router.post(
    '/webhook',paymentController.handleStripeWebhook);

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
