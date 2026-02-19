const express = require("express");
const router = express.Router();

const tenantController = require("../controllers/tenantController");
const auth = require("../middlewares/authMiddleware");

router.post("/apply", auth, tenantController.applyForUnit);
router.post("/sign-lease", auth, tenantController.signLease);
router.post(
  "/request-termination",
  auth,
  tenantController.requestLeaseTermination,
);
router.post("/pay-invoice", auth, tenantController.payInvoice);
router.get("/units-search", tenantController.searchByRentAmount);

module.exports = router;
