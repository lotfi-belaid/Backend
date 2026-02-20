const bcrypt = require("bcrypt");
const User = require("../models/userSchema");
const Property = require("../models/propertySchema");
const Unit = require("../models/unitSchema");
const Lease = require("../models/leaseSchema");
const Invoice = require("../models/invoiceSchema");
const Maintenance = require("../models/maintenanceSchema");
//ban user
module.exports.banUser = async (req, res) => {
  try {
    const currentUser = req.user;

    if (!currentUser || currentUser.role !== "ADMIN") {
      return res.status(403).json({ message: "Only admins can ban users" });
    }
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isBanned = true;
    await user.save();

    res.json({ message: `User ${user.name} banned successfully`, user });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
// Approve user
module.exports.approveUser = async (req, res) => {
  try {
    const currentUser = req.user;

    if (!currentUser || currentUser.role !== "ADMIN") {
      return res.status(403).json({ message: "Only admins can approve users" });
    }

    const { id } = req.params;
    const user = await User.findByIdAndUpdate(
      id,
      { isApproved: true },
      { new: true, runValidators: false }
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: `User ${user.name} approved successfully`, user });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
// view Dashboard Stats
module.exports.viewDashboard = async (req, res) => {
  try {
    const currentUser = req.user;

    if (!currentUser || currentUser.role !== "ADMIN") {
      return res
        .status(403)
        .json({ message: "Only admins can view dashboard" });
    }
    const totalUsers = await User.countDocuments();
    const admins = await User.countDocuments({ role: "ADMIN" });
    const owners = await User.countDocuments({ role: "OWNER" });
    const tenants = await User.countDocuments({ role: "TENANT" });
    const vendors = await User.countDocuments({ role: "VENDOR" });

    const totalProperties = await Property.countDocuments();
    const totalLeases = await Lease.countDocuments({ status: "ACTIVE" });
    const totalMaintenance = await Maintenance.countDocuments();
    const pendingApprovals = await User.countDocuments({ isApproved: false });

    const invoicesPaid = await Invoice.countDocuments({ status: "PAID" });
    const invoicesPending = await Invoice.countDocuments({ status: "UNPAID" });

    res.json({
      message: "Dashboard summary fetched successfully",
      data: {
        users: { totalUsers, admins, owners, tenants, vendors },
        properties: totalProperties,
        leases: totalLeases,
        maintenance: totalMaintenance,
        pendingApprovals,
        invoices: { paid: invoicesPaid, pending: invoicesPending },
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching dashboard data", error });
  }
};
