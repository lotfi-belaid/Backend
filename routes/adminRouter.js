const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const auth = require("../middlewares/authMiddleware");

router.post("/ban/:id", auth, adminController.banUser);
router.post("/approve/:id", auth, adminController.approveUser);
router.get("/dashboard", auth, adminController.viewDashboard);
router.get("/analytics", auth, adminController.getAnalytics);
router.delete("/owner/:id", auth, adminController.deleteOwnerAndAllRelatedData);

module.exports = router;
