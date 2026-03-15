const Maintenance = require("../models/maintenanceSchema");
const User = require("../models/userSchema");

async function assignVendor(ownerId, data) {
  const { vendorId, maintenanceId } = data;
  const vendor = await User.findById(vendorId);
  const maintenance = await Maintenance.findById(maintenanceId);

  if (!vendor || vendor.role !== "VENDOR") {
    const error = new Error("Invalid vendor ID");
    error.status = 400;
    throw error;
  }
  if (vendor.isBanned) {
    const error = new Error("Vendor account is banned");
    error.status = 403;
    throw error;
  }
  if (!vendor.isApproved) {
    const error = new Error("Vendor account not yet approved");
    error.status = 403;
    throw error;
  }

  if (!maintenance) {
    const error = new Error("Maintenance not found");
    error.status = 404;
    throw error;
  }

  maintenance.vendorId = vendorId;
  await maintenance.save();
  return { vendorName: vendor.name, maintenance };
}

async function acceptJob(vendorId, maintenanceId) {
  const vendor = await User.findById(vendorId);
  const maintenance = await Maintenance.findById(maintenanceId);

  if (!vendor || vendor.role !== 'VENDOR') {
    const error = new Error('Only vendors can accept jobs');
    error.status = 403;
    throw error;
  }
  if (vendor.isBanned) {
    const error = new Error('Your account is banned');
    error.status = 403;
    throw error;
  }
  if (!vendor.isApproved) {
    const error = new Error('Your account is not approved yet');
    error.status = 403;
    throw error;
  }
  if (!maintenance) {
    const error = new Error('Maintenance job not found');
    error.status = 404;
    throw error;
  }
  if (maintenance.vendorId && String(maintenance.vendorId) !== String(vendorId)) {
    const error = new Error('This job is assigned to another vendor');
    error.status = 403;
    throw error;
  }
  maintenance.vendorId = vendorId;
  maintenance.status = 'IN_PROGRESS';
  await maintenance.save();
  return { vendorName: vendor.name, maintenance };
}

async function addRepairReport(vendorId, data) {
  const { maintenanceId, description, cost } = data;
  const vendor = await User.findById(vendorId);
  if (!vendor || vendor.role !== 'VENDOR') {
    const error = new Error('Only vendors can submit repair reports');
    error.status = 403;
    throw error;
  }
  if (vendor.isBanned) {
    const error = new Error('Your account is banned');
    error.status = 403;
    throw error;
  }
  if (!vendor.isApproved) {
    const error = new Error('Your account is not approved yet');
    error.status = 403;
    throw error;
  }

  const maintenance = await Maintenance.findById(maintenanceId);
  if (!maintenance) {
    const error = new Error('Maintenance not found');
    error.status = 404;
    throw error;
  }
  if (String(maintenance.vendorId) !== String(vendorId)) {
    const error = new Error('You can only report your assigned jobs');
    error.status = 403;
    throw error;
  }

  maintenance.report = {
    description,
    cost,
    submittedAt: new Date()
  };
  maintenance.status = 'DONE';
  await maintenance.save();
  return maintenance;
}

module.exports = {
  assignVendor,
  acceptJob,
  addRepairReport,
};
