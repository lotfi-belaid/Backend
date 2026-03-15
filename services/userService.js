const User = require("../models/userSchema");
const bcrypt = require("bcrypt");

const passwordPolicy = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

function validatePassword(password) {
  if (!passwordPolicy.test(password)) {
    const error = new Error("Password must contain at least 8 characters, including uppercase, lowercase, number, and special character");
    error.status = 400;
    throw error;
  }
}

async function createUser(userData) {
  validatePassword(userData.password);
  const existing = await User.findOne({ email: userData.email });
  if (existing) {
    const error = new Error("Email already registered");
    error.status = 400;
    throw error;
  }
  const newUser = new User(userData);
  await newUser.save();
  return newUser;
}

async function getAllUsers() {
  return await User.find();
}

async function getUserById(id) {
  const user = await User.findById(id)
    .populate("properties")
    .populate("leases")
    .populate("assignedMaintenance");
  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }
  return user;
}

async function getUsersByRole(role) {
  if (!role) {
    const error = new Error("Missing role information.");
    error.status = 400;
    throw error;
  }
  return await User.find({ role });
}

async function updateUserById(id, data) {
  const user = await User.findByIdAndUpdate(id, data, { new: true });
  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }
  return user;
}

async function deleteUserById(id) {
  const deleted = await User.findByIdAndDelete(id);
  if (!deleted) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }
  return deleted;
}

async function searchUsersByName(name) {
  return await User.find({ name: { $regex: name || "", $options: "i" } });
}

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  getUsersByRole,
  updateUserById,
  deleteUserById,
  searchUsersByName,
};
