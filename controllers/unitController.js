const unitService = require("../services/unitService");

//add unit to property
module.exports.addUnit = async (req, res) => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      return res.status(401).json({ message: "Unauthorized: no user in token" });
    }

    const unit = await unitService.addUnit(ownerId, req.body);
    res.status(201).json({ message: "Unit added successfully", unit });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Server Error", error });
  }
};

//update Unit
module.exports.updateUnitById = async (req, res) => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      return res.status(401).json({ message: "Unauthorized: no user in token" });
    }
    const { unitId } = req.params;

    const unit = await unitService.updateUnit(ownerId, unitId, req.body);
    res.json({ message: "unit updated successfully", unit });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Server Error", error });
  }
};

//delete unit
module.exports.deleteUnit = async (req, res) => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      return res.status(401).json({ message: "Unauthorized: no user in token" });
    }
    const { unitId } = req.params;
    const { propertyId } = req.body;

    const result = await unitService.deleteUnit(ownerId, unitId, propertyId);
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Server Error", error });
  }
};

//get all units for specific property
module.exports.getAllUnitByProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const units = await unitService.getUnitsByProperty(propertyId);
    res.status(200).json(units);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Server Error", error });
  }
};

//get All units
module.exports.getAllUnits = async (req, res) => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      return res.status(401).json({ message: "Unauthorized: no user in token" });
    }
    const units = await unitService.getAllUnits();
    res.json(units);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

//apply for Unit
module.exports.applyForUnit = async (req, res) => {
  try {
    const tenantId = req.user?.id;
    if (!tenantId) {
      return res.status(401).json({ message: "Unauthorized: no user in token" });
    }
    const { unitId } = req.params;

    const { tenant, unit } = await unitService.applyForUnit(tenantId, unitId);
    res.status(201).json({ message: `Tenant ${tenant.name} applied for unit #${unitId}` });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Server Error", error });
  }
};

//search units by rent amount
module.exports.searchByRentAmount = async (req, res) => {
  try {
    const { sort } = req.query;
    const units = await unitService.searchUnitsByRent(sort);
    res.status(200).json(units);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Server Error", error });
  }
};
