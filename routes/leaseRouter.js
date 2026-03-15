const express = require("express");
const router = express.Router();
const leaseController = require("../controllers/leaseController");
const auth = require("../middlewares/authMiddleware");

// Base path: /leases
router.post("/approve", auth, leaseController.approveApplication);
router.post("/:id/sign", auth, leaseController.signLease);
router.post("/:id/terminate-request", auth, leaseController.requestLeaseTermination);
router.post("/:id/terminate-review", auth, leaseController.reviewLeaseTermination);

module.exports = router;
