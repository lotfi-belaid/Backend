const express = require("express");
const router = express.Router();

const authRouter = require("./authRouter");
const adminRouter = require("./adminRouter");
const ownerRouter = require("./ownerRouter");
const tenantRouter = require("./tenantRouter");
const vendorRouter = require("./vendorRouter");
const paymentRouter = require("./paymentRouter");
const userCrudRouter = require("./userCrudRouter");

// Keep old endpoint paths unchanged under /users
router.use("/", authRouter);
router.use("/admin", adminRouter);
router.use("/owner", ownerRouter);
router.use("/tenant", tenantRouter);
router.use("/vendor", vendorRouter);
router.use("/", paymentRouter);
router.use("/", userCrudRouter);

module.exports = router;
