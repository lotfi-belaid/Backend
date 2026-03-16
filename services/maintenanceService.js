const Maintenance = require("../models/maintenanceSchema");
const User = require("../models/userSchema");
const notificationService = require("./notificationService");

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

  // Notify vendor
  await notificationService.sendNotification(
    vendorId,
    "New Job Assigned",
    `You have been assigned a new maintenance job for task: ${maintenance.description}`,
    "MAINTENANCE"
  );

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

  // Notify tenant/owner (assuming we can get requestedBy from maintenance)
  await notificationService.sendNotification(
    maintenance.requestedBy,
    "Repair Complete",
    `The repair for "${maintenance.description}" has been completed by the vendor.`,
    "MAINTENANCE"
  );

  return maintenance;
}

async function getTenantMaintenanceRequests(tenantId) {
  return await Maintenance.find({ requestedBy: tenantId }).sort({ createdAt: -1 });
}

async function getOwnerMaintenanceOverview(ownerId) {
  // Finding properties owned by the owner, then units in those properties
  const Property = require("../models/propertySchema");
  const Unit = require("../models/unitSchema");
  const properties = await Property.find({ ownerId }).select("_id");
  const propIds = properties.map(p => p._id);
  const units = await Unit.find({ propertyId: { $in: propIds } }).select("_id");
  const unitIds = units.map(u => u._id);
  
  return await Maintenance.find({ unitId: { $in: unitIds } }).populate("unitId").sort({ createdAt: -1 });
}

async function getVendorAssignedJobs(vendorId) {
  return await Maintenance.find({ vendorId }).sort({ createdAt: -1 });
}

module.exports = {
  assignVendor,
  acceptJob,
  addRepairReport,
  getTenantMaintenanceRequests,
  getOwnerMaintenanceOverview,
  getVendorAssignedJobs,
};
