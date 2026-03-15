const leaseService = require("../services/leaseService");

// Approve tenant application (and then creates lease automatically)
module.exports.approveApplication = async (req, res) => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      return res.status(401).json({ message: "Unauthorized: no user in token" });
    }

    const { lease, tenantName } = await leaseService.approveApplication(ownerId, req.body);
    res.status(201).json({
      message: `Tenant ${tenantName}'s application approved and lease created.`,
      lease,
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Server Error", error });
  }
};

//approve or terminate lease termination request
module.exports.reviewLeaseTermination = async (req, res) => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      return res.status(401).json({ message: "Unauthorized: no user in token" });
    }

    const { id: leaseId } = req.params;
    const result = await leaseService.reviewTermination(ownerId, { ...req.body, leaseId });
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Server Error", error });
  }
};

//sign Lease
module.exports.signLease = async (req, res) => {
  try {
    const tenantId = req.user?.id;
    if (!tenantId) {
      return res.status(401).json({ message: "Unauthorized: no user in token" });
    }
    const { id: leaseId } = req.params;
    // The line `const { tenantId } = req.user;` was removed to prevent redeclaration of tenantId.
    // The comment `// Note: unitService/leaseService handles tenantId check` is kept for context.

    const { lease, tenantName } = await leaseService.signLease(tenantId, leaseId);
    res.json({
      message: `Lease #${leaseId} signed successfully by ${tenantName}`,
      lease,
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Server Error", error });
  }
};

//request Lease Termination
module.exports.requestLeaseTermination = async (req, res) => {
  try {
    const tenantId = req.user?.id;
    if (!tenantId) {
      return res.status(401).json({ message: "Unauthorized: no user in token" });
    }

    const { id: leaseId } = req.params;
    const lease = await leaseService.requestTermination(tenantId, { ...req.body, leaseId });
    res.json({ message: "Termination requested. Owner will review.", lease });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Server Error", error });
  }
};
