const Lease = require("../models/leaseSchema");
const Unit = require("../models/unitSchema");
const User = require("../models/userSchema");
const notificationService = require("./notificationService");

async function approveApplication(ownerId, data) {
  const { tenantId, unitId, leaseStartDate, leaseEndDate, rentAmount } = data;

  const owner = await User.findById(ownerId);
  if (!owner || owner.role !== "OWNER") {
    const error = new Error("Only owners can approve applications");
    error.status = 403;
    throw error;
  }
  if (owner.isBanned) {
    const error = new Error("Your account is banned");
    error.status = 403;
    throw error;
  }
  if (!owner.isApproved) {
    const error = new Error("Your account is not approved yet");
    error.status = 403;
    throw error;
  }

  const tenant = await User.findById(tenantId);
  if (!tenant || tenant.role !== "TENANT") {
    const error = new Error("Invalid tenant ID");
    error.status = 400;
    throw error;
  }

  const unit = await Unit.findById(unitId);
  if (!unit) {
    const error = new Error("Unit not found");
    error.status = 404;
    throw error;
  }
  if (unit.status === "OCCUPIED") {
    const error = new Error("Unit already occupied");
    error.status = 400;
    throw error;
  }

  const lease = new Lease({
    unitId,
    tenantId,
    ownerId,
    startDate: leaseStartDate || new Date(),
    endDate: leaseEndDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    rentAmount: rentAmount || unit.rentAmount,
    depositAmount: unit.depositAmount || 0,
    status: "ACTIVE",
  });

  await lease.save();
  unit.status = "OCCUPIED";
  await unit.save();

  // Notify tenant
  await notificationService.sendNotification(
    tenantId,
    "Lease Approved!",
    `Congratulations! Your application for unit ${unit.unitNumber} has been approved.`,
    "LEASE"
  );

  return { lease, tenantName: tenant.name };
}

async function reviewTermination(ownerId, data) {
  const { leaseId, decision } = data;
  const lease = await Lease.findById(leaseId);
  if (!lease) {
    const error = new Error("Lease not found");
    error.status = 404;
    throw error;
  }
  if (String(lease.ownerId) !== String(ownerId)) {
    const error = new Error("You can only review terminations for your own leases");
    error.status = 403;
    throw error;
  }
  if (!lease.termination || lease.termination.status !== "REQUESTED") {
    const error = new Error("No pending termination request for this lease");
    error.status = 400;
    throw error;
  }

  lease.termination.reviewedBy = ownerId;
  lease.termination.reviewedAt = new Date();

  if (decision === "APPROVE") {
    lease.termination.status = "APPROVED";
    lease.status = "TERMINATED";
    await lease.save();
    await Unit.findByIdAndUpdate(lease.unitId, { status: "AVAILABLE" });
    return { message: "Termination approved. Lease ended and unit freed.", lease };
  }

  lease.termination.status = "REJECTED";
  await lease.save();
  return { message: "Termination request rejected. Lease remains ACTIVE.", lease };
}

async function signLease(tenantId, leaseId) {
  const tenant = await User.findById(tenantId);
  const lease = await Lease.findById(leaseId);

  if (!tenant || tenant.role !== "TENANT") {
    const error = new Error("Only tenants can sign leases");
    error.status = 403;
    throw error;
  }
  if (tenant.isBanned) {
    const error = new Error("Your account is banned");
    error.status = 403;
    throw error;
  }
  if (!tenant.isApproved) {
    const error = new Error("Your account is not approved yet");
    error.status = 403;
    throw error;
  }
  if (!lease) {
    const error = new Error("Lease not found");
    error.status = 404;
    throw error;
  }
  lease.status = "ACTIVE";
  await lease.save();
  return { lease, tenantName: tenant.name };
}

async function requestTermination(tenantId, data) {
  const { leaseId, reason } = data;
  const lease = await Lease.findById(leaseId);
  if (!lease) {
    const error = new Error("Lease not found");
    error.status = 404;
    throw error;
  }
  if (String(lease.tenantId) !== String(tenantId)) {
    const error = new Error("You can only request termination of your own lease");
    error.status = 403;
    throw error;
  }
  if (lease.status !== "ACTIVE") {
    const error = new Error("Only ACTIVE leases can be requested to terminate");
    error.status = 400;
    throw error;
  }
  if (lease.termination && lease.termination.status === "REQUESTED") {
    const error = new Error("You already have a pending termination request");
    error.status = 400;
    throw error;
  }

  lease.termination = {
    status: "REQUESTED",
    reason: reason || "",
    requestedBy: tenantId,
    requestedAt: new Date(),
  };
  await lease.save();
  
  // Notify owner
  await notificationService.sendNotification(
    lease.ownerId,
    "Termination Requested",
    `A tenant has requested to terminate their lease for unit ${lease.unitId}.`,
    "LEASE"
  );

  return lease;
}

async function getTenantLeases(tenantId) {
  return await Lease.find({ tenantId }).populate("unitId").populate("ownerId");
}

async function getOwnerLeases(ownerId) {
  return await Lease.find({ ownerId }).populate("unitId").populate("tenantId");
}

module.exports = {
  approveApplication,
  reviewTermination,
  signLease,
  requestTermination,
  getTenantLeases,
  getOwnerLeases,
};
