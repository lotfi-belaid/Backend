const express = require("express");
const router = express.Router();

const ownerController = require("../controllers/ownerController");
const auth = require("../middlewares/authMiddleware");

// properties
router.post("/property", auth, ownerController.addProperty);
router.get("/properties/:ownerId", auth, ownerController.getAllPropertyByOwner);
router.get("/properties", auth, ownerController.getAllPorperties);
router.put("/property", auth, ownerController.updateProperty);
router.delete("/property", auth, ownerController.deleteProperty);

// units
router.post("/unit", auth, ownerController.addUnit);
router.get("/units/:propertyId", auth, ownerController.getAllUnitByProperty);
router.get("/units", auth, ownerController.getAllUnits);
router.put("/unit/:unitId", auth, ownerController.updateUnitById);
router.delete("/unit/:unitId", auth, ownerController.deleteUnit);

// applications / leases
router.post("/approve-application", auth, ownerController.approveApplication);
router.post("/review-termination", auth, ownerController.reviewLeaseTermination);

// payments & vendors
router.get("/payments", auth, ownerController.viewPayments);
router.post("/assign-vendor", auth, ownerController.assignVendor);

module.exports = router;
