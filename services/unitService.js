const User = require("../models/userSchema");
const Property = require("../models/propertySchema");
const Unit = require("../models/unitSchema");

async function addUnit(ownerId, data) {
  const { propertyId } = data;
  const owner = await User.findById(ownerId);
  if (!owner || owner.role !== "OWNER") {
    const error = new Error("Only owners can add units");
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
  const property = await Property.findById(propertyId);
  if (!property) {
    const error = new Error("Property not found");
    error.status = 404;
    throw error;
  }
  if (String(property.ownerId) !== String(ownerId)) {
    const error = new Error("You can only add units to your own properties");
    error.status = 403;
    throw error;
  }

  const unit = new Unit({ ...data, status: "AVAILABLE" });
  await unit.save();
  return unit;
}

async function updateUnit(ownerId, unitId, data) {
  const { propertyId } = data;
  const owner = await User.findById(ownerId);
  if (!owner || owner.role !== "OWNER") {
    const error = new Error("only owner can update the units");
    error.status = 403;
    throw error;
  }
  if (owner.isBanned) {
    const error = new Error("your account is banned");
    error.status = 403;
    throw error;
  }
  if (!owner.isApproved) {
    const error = new Error("your account is not approved yet");
    error.status = 403;
    throw error;
  }
  const property = await Property.findById(propertyId);
  if (!property) {
    const error = new Error("Property not found");
    error.status = 404;
    throw error;
  }
  const unit = await Unit.findById(unitId);
  if (!unit) {
    const error = new Error("Unit not found");
    error.status = 404;
    throw error;
  }
  if (String(property.ownerId) !== String(ownerId)) {
    const error = new Error("you can only update your own Properties");
    error.status = 403;
    throw error;
  }
  if (String(unit.propertyId) !== String(propertyId)) {
    const error = new Error("you can only update units belonging to this property");
    error.status = 403;
    throw error;
  }

  const { unitNumber, bedrooms, bathrooms, areaM2, rentAmount, depositAmount, status } = data;
  if (unitNumber !== undefined) unit.unitNumber = unitNumber;
  if (bedrooms !== undefined) unit.bedrooms = bedrooms;
  if (bathrooms !== undefined) unit.bathrooms = bathrooms;
  if (areaM2 !== undefined) unit.areaM2 = areaM2;
  if (rentAmount !== undefined) unit.rentAmount = rentAmount;
  if (depositAmount !== undefined) unit.depositAmount = depositAmount;
  if (status !== undefined) unit.status = status;

  await unit.save();
  return unit;
}

async function deleteUnit(ownerId, unitId, propertyId) {
  const owner = await User.findById(ownerId);
  if (!owner || owner.role !== "OWNER") {
    const error = new Error("only owner can delete units");
    error.status = 403;
    throw error;
  }
  if (owner.isBanned) {
    const error = new Error("your account is banned");
    error.status = 403;
    throw error;
  }
  if (!owner.isApproved) {
    const error = new Error("your account is not approved yet");
    error.status = 403;
    throw error;
  }
  const property = await Property.findById(propertyId);
  if (!property) {
    const error = new Error("property not found");
    error.status = 404;
    throw error;
  }
  if (String(property.ownerId) !== String(ownerId)) {
    const error = new Error("you can only delete units in your own property");
    error.status = 403;
    throw error;
  }
  const unit = await Unit.findById(unitId);
  if (!unit) {
    const error = new Error("unit not found");
    error.status = 404;
    throw error;
  }
  if (String(unit.propertyId) !== String(propertyId)) {
    const error = new Error("you can only delete units belongs to this property");
    error.status = 403;
    throw error;
  }
  await unit.deleteOne();
  return { message: "unit deleted successfully" };
}

async function getUnitsByProperty(propertyId) {
  const property = await Property.findById(propertyId);
  if (!property) {
    const error = new Error("Property not found");
    error.status = 404;
    throw error;
  }
  return await Unit.find({ propertyId });
}

async function getAllUnits() {
  return await Unit.find();
}

async function applyForUnit(tenantId, unitId) {
  const tenant = await User.findById(tenantId);
  const unit = await Unit.findById(unitId);

  if (!tenant || tenant.role !== "TENANT") {
    const error = new Error("Only tenants can apply for units");
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
  if (!unit || unit.status !== "AVAILABLE") {
    const error = new Error("Unit not available");
    error.status = 400;
    throw error;
  }

  return { tenant, unit };
}

async function searchUnitsByRent(sort) {
  const sortedList = sort === "Highest Price" ? -1 : 1;
  return await Unit.find().sort({ rentAmount: sortedList });
}

module.exports = {
  addUnit,
  updateUnit,
  deleteUnit,
  getUnitsByProperty,
  getAllUnits,
  applyForUnit,
  searchUnitsByRent,
};
