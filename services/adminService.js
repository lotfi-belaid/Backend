const User = require("../models/userSchema");
const Property = require("../models/propertySchema");
const Lease = require("../models/leaseSchema");
const Maintenance = require("../models/maintenanceSchema");
const Invoice = require("../models/invoiceSchema");
const mongoose = require("mongoose");

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
async function deleteOwnerAndAllRelatedData(ownerId) {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const owner = await User.findById(ownerId).session(session);
    if (!owner || owner.role != "OWNER") {
      const error = new Error("Invalid Owner ID");
      error.status = 400;
      throw error;
    }
    const properties = await Property.find({ ownerId }).session(session);
    const propertyIds = properties.map(p => p._id);

    const units = await Unit.find({ propertyId: { $in: propertyIds } }).session(session);
    const unitIds = units.map(u => u._id);

    const leases = await Lease.find({ unitId: { $in: unitIds } }).session(session);
    const leaseIds = leases.map(l => l._id);

    await Invoice.deleteMany({ leaseId: { $in: leaseIds } }).session(session);
    await Maintenance.deleteMany({ unitId: { $in: unitIds } }).session(session);
    await Lease.deleteMany({ unitId: { $in: unitIds } }).session(session);
    await Unit.deleteMany({ propertyId: { $in: propertyIds } }).session(session);
    await Property.deleteMany({ ownerId }).session(session);
    await User.findByIdAndDelete(ownerId).session(session);
    await session.commitTransaction();
  }
  catch (error) {
    await session.abortTransaction();
    throw error;

  }
  finally {
    session.endSession();
  }

};

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
