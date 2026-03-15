const User = require("../models/userSchema");
const Property = require("../models/propertySchema");

async function addProperty(ownerId, data) {
  const owner = await User.findById(ownerId);
  if (!owner || owner.role !== "OWNER") {
    const error = new Error("Only owners can add properties");
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

  const property = new Property({ ownerId, ...data });
  await property.save();

  owner.ownerTotalProperties = (owner.ownerTotalProperties ?? 0) + 1;
  await owner.save();

  return property;
}

async function updateProperty(ownerId, propertyId, data) {
  const owner = await User.findById(ownerId);
  if (!owner || owner.role !== "OWNER") {
    const error = new Error("Only owners can update properties");
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
    const error = new Error("You can only update your own properties");
    error.status = 403;
    throw error;
  }

  const { name, address, city, postalCode, description } = data;
  if (name) property.name = name;
  if (address) property.address = address;
  if (city) property.city = city;
  if (postalCode) property.postalCode = postalCode;
  if (description) property.description = description;

  await property.save();
  return property;
}

async function deleteProperty(ownerId, propertyId) {
  const owner = await User.findById(ownerId);
  if (!owner || owner.role !== "OWNER") {
    const error = new Error("Only owners can delete properties");
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
    const error = new Error("You can only delete your own properties");
    error.status = 403;
    throw error;
  }

  await property.deleteOne();
  return { message: "Property deleted successfully" };
}

async function getOwnerProperties(ownerId) {
  const owner = await User.findById(ownerId);
  if (!owner || owner.role !== "OWNER") {
    const error = new Error("only owners can see own Properties");
    error.status = 403;
    throw error;
  }
  if (owner.isBanned) {
    const error = new Error("your account is banned ");
    error.status = 403;
    throw error;
  }
  if (!owner.isApproved) {
    const error = new Error("your account is not approved yet");
    error.status = 403;
    throw error;
  }

  return await Property.find({ ownerId });
}

async function getAllProperties() {
  return await Property.find();
}

module.exports = {
  addProperty,
  updateProperty,
  deleteProperty,
  getOwnerProperties,
  getAllProperties,
};
