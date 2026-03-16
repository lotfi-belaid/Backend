const express = require("express");
const router = express.Router();
const maintenanceController = require("../controllers/maintenanceController");
const auth = require("../middlewares/authMiddleware");

// Base path: /maintenance
router.get("/tenant", auth, maintenanceController.getTenantRequests);
router.get("/owner", auth, maintenanceController.getOwnerOverview);
router.get("/vendor", auth, maintenanceController.getVendorJobs);
router.post("/assign", auth, maintenanceController.assignVendor);
router.post("/:id/accept", auth, maintenanceController.acceptJob);
router.post("/:id/report", auth, maintenanceController.addRepairReport);

module.exports = router;
