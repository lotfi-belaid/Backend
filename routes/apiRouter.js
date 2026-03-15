const express = require("express");
const router = express.Router();

const authRouter = require("./authRouter");
const adminRouter = require("./adminRouter");
const propertyRouter = require("./propertyRouter");
const unitRouter = require("./unitRouter");
const leaseRouter = require("./leaseRouter");
const maintenanceRouter = require("./maintenanceRouter");
const invoiceRouter = require("./invoiceRouter");
const userCrudRouter = require("./userCrudRouter");

// Health check / Index
router.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Estate Management API is running" });
});

// Core User Operations
router.use("/", authRouter);
router.use("/admin", adminRouter);
router.use("/", userCrudRouter);

// Resource-Based Routes
router.use("/properties", propertyRouter);
router.use("/units", unitRouter);
router.use("/leases", leaseRouter);
router.use("/maintenance", maintenanceRouter);
router.use("/invoices", invoiceRouter);

module.exports = router;
