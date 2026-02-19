const express = require("express");
const router = express.Router();

const vendorController = require("../controllers/vendorController");
const auth = require("../middlewares/authMiddleware");

router.post("/accept-job", auth, vendorController.acceptJob);
router.post("/add-report", auth, vendorController.addRepairReport);

module.exports = router;
