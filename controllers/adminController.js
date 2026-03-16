const adminService = require("../services/adminService");

//ban user
module.exports.banUser = async (req, res) => {
  try {
    const user = await adminService.banUser(req.params.id);
    res.json({ message: `User ${user.name} banned successfully`, user });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Server Error", error });
  }
};

// Approve user
module.exports.approveUser = async (req, res) => {
  try {
    const user = await adminService.approveUser(req.params.id);
    res.json({ message: `User ${user.name} approved successfully`, user });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Server Error", error });
  }
};

// view Dashboard Stats
module.exports.viewDashboard = async (req, res) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.json({
      message: "Dashboard summary fetched successfully",
      data: stats,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching dashboard data", error });
  }
};

// get Advanced Analytics
module.exports.getAnalytics = async (req, res) => {
  try {
    const analytics = await adminService.getAdvancedAnalytics();
    res.json({
      message: "Advanced analytics fetched successfully",
      data: analytics,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching analytics", error });
  }
};

// Delete Owner and All Related Data
module.exports.deleteOwnerAndAllRelatedData = async (req, res) => {
  try {
    await adminService.deleteOwnerAndAllRelatedData(req.params.id);
    res.json({ message: "Owner and all related data deleted successfully" });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Error deleting owner data", error });
  }
};
