const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/ownerController');
const auth = require('../middlewares/authMiddleware');
const { validateCreateProperty, validateCreateUnit } = require('../validators');

// All owner routes require authentication
router.use(auth);

/* ---------- PROPERTY ROUTES ---------- */

// Create property
router.post('/property', validateCreateProperty, ownerController.addProperty);

// Get all properties for owner
router.get('/properties/:ownerId', ownerController.getAllPropertyByOwner);

// Get all properties
router.get('/properties', ownerController.getAllPorperties);

// Update property
router.put('/property', ownerController.updateProperty);

// Delete property
router.delete('/property', ownerController.deleteProperty);

/* ---------- UNIT ROUTES ---------- */

// Create unit
router.post('/unit', validateCreateUnit, ownerController.addUnit);

// Get all units for specific property
router.get('/units/:propertyId', ownerController.getAllUnitByProperty);

// Get all units
router.get('/units', ownerController.getAllUnits);

// Update unit
router.put('/unit/:unitId', ownerController.updateUnitById);

// Delete unit
router.delete('/unit/:unitId', ownerController.deleteUnit);

/* ---------- APPLICATION / LEASE ROUTES ---------- */

// Approve tenant application
router.post('/approve-application', ownerController.approveApplication);

// Review lease termination request
router.post('/review-termination', ownerController.reviewLeaseTermination);

/* ---------- PAYMENT & VENDOR ROUTES ---------- */

// View payments
router.get('/payments', ownerController.viewPayments);

// Assign vendor to maintenance task
router.post('/assign-vendor', ownerController.assignVendor);

module.exports = router;
