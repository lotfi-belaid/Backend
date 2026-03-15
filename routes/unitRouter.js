const express = require("express");
const router = express.Router();
const unitController = require("../controllers/unitController");
const auth = require("../middlewares/authMiddleware");

// Base path: /units
router.post("/", auth, unitController.addUnit);
router.get("/", auth, unitController.getAllUnits);
router.get("/property/:propertyId", auth, unitController.getAllUnitByProperty);
router.put("/:unitId", auth, unitController.updateUnitById);
router.delete("/:unitId", auth, unitController.deleteUnit);

// Tenant applications
router.post("/:unitId/apply", auth, unitController.applyForUnit);

// Search
router.get("/search", unitController.searchByRentAmount);

module.exports = router;
