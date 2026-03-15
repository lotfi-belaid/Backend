const express = require("express");
const router = express.Router();
const maintenanceController = require("../controllers/maintenanceController");
const auth = require("../middlewares/authMiddleware");

// Base path: /maintenance
router.post("/assign", auth, maintenanceController.assignVendor);
router.post("/:id/accept", auth, maintenanceController.acceptJob);
router.post("/:id/report", auth, maintenanceController.addRepairReport);

module.exports = router;
