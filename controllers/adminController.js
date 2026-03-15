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
