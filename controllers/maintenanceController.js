const maintenanceService = require("../services/maintenanceService");

// assign vendor to maintenance task
module.exports.assignVendor = async (req, res) => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      return res.status(401).json({ message: "Unauthorized: no user in token" });
    }

    const { vendorName, maintenance } = await maintenanceService.assignVendor(ownerId, req.body);
    res.json({
      message: `Vendor ${vendorName} assigned successfully`,
      maintenance,
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Server Error", error });
  }
};

//acceptJob
module.exports.acceptJob = async (req, res) => {
  try {
    const vendorId = req.user?.id;
    if (!vendorId) {
      return res.status(401).json({ message: "Unauthorized: no user in token" });
    }
    const { id: maintenanceId } = req.params;

    const { vendorName, maintenance } = await maintenanceService.acceptJob(vendorId, maintenanceId);
    res.json({ message: `Maintenance job #${maintenanceId} accepted successfully by ${vendorName}`, maintenance });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Server Error", error });
  }
};

//add Repair Report and Mark as Done
module.exports.addRepairReport = async (req, res) => {
  try {
    const vendorId = req.user?.id;
    if (!vendorId) {
      return res.status(401).json({ message: "Unauthorized: no user in token" });
    }

    const maintenance = await maintenanceService.addRepairReport(vendorId, req.body);
    res.json({
      message: 'Repair report submitted successfully',
      maintenance
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Server Error", error });
  }
};

// get Tenant Maintenance Requests
module.exports.getTenantRequests = async (req, res) => {
  try {
    const requests = await maintenanceService.getTenantMaintenanceRequests(req.user.id);
    res.json({ data: requests });
  } catch (error) {
    res.status(500).json({ message: "Error fetching requests", error });
  }
};

// get Owner Maintenance Overview
module.exports.getOwnerOverview = async (req, res) => {
  try {
    const overview = await maintenanceService.getOwnerMaintenanceOverview(req.user.id);
    res.json({ data: overview });
  } catch (error) {
    res.status(500).json({ message: "Error fetching overview", error });
  }
};

// get Vendor Assigned Jobs
module.exports.getVendorJobs = async (req, res) => {
  try {
    const jobs = await maintenanceService.getVendorAssignedJobs(req.user.id);
    res.json({ data: jobs });
  } catch (error) {
    res.status(500).json({ message: "Error fetching jobs", error });
  }
};
