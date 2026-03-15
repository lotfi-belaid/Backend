const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/userSchema");

async function login(email, password) {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error("Invalid email");
    error.status = 400;
    throw error;
  }
  
  if (user.isBanned) {
    const error = new Error("Your account has been banned. Please contact support.");
    error.status = 403;
    throw error;
  }

  if (!user.isApproved) {
    const error = new Error("Your account is awaiting approval by the admin.");
    error.status = 403;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error("Invalid password");
    error.status = 400;
    throw error;
  }

  const payload = { id: user._id, role: user.role };
  const token = jwt.sign(payload, process.env.SECRET_JWT, { expiresIn: "7h" });

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

module.exports = { login };
