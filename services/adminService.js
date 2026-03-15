const User = require("../models/userSchema");
const Property = require("../models/propertySchema");
const Lease = require("../models/leaseSchema");
const Maintenance = require("../models/maintenanceSchema");
const Invoice = require("../models/invoiceSchema");

async function banUser(userId) {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }
  user.isBanned = true;
  await user.save();
  return user;
}

async function approveUser(userId) {
  const user = await User.findByIdAndUpdate(
    userId,
    { isApproved: true },
    { new: true, runValidators: false }
  );
  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }
  return user;
}

async function getDashboardStats() {
  const [
    totalUsers,
    admins,
    owners,
    tenants,
    vendors,
    totalProperties,
    totalLeases,
    totalMaintenance,
    pendingApprovals,
    invoicesPaid,
    invoicesPending,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "ADMIN" }),
    User.countDocuments({ role: "OWNER" }),
    User.countDocuments({ role: "TENANT" }),
    User.countDocuments({ role: "VENDOR" }),
    Property.countDocuments(),
    Lease.countDocuments({ status: "ACTIVE" }),
    Maintenance.countDocuments(),
    User.countDocuments({ isApproved: false }),
    Invoice.countDocuments({ status: "PAID" }),
    Invoice.countDocuments({ status: "UNPAID" }),
  ]);

  return {
    users: { totalUsers, admins, owners, tenants, vendors },
    properties: totalProperties,
    leases: totalLeases,
    maintenance: totalMaintenance,
    pendingApprovals,
    invoices: { paid: invoicesPaid, pending: invoicesPending },
  };
}

module.exports = {
  banUser,
  approveUser,
  getDashboardStats,
};
