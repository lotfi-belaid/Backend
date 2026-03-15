const propertyService = require("../services/propertyService");

//add property
module.exports.addProperty = async (req, res) => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      return res.status(401).json({ message: "Unauthorized: no user in token" });
    }

    const property = await propertyService.addProperty(ownerId, req.body);
    res.status(201).json({ message: "Property created successfully", property });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Server Error", error });
  }
};

//update property details
module.exports.updateProperty = async (req, res) => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      return res.status(401).json({ message: "Unauthorized: no user in token" });
    }
    const propertyId = req.params.id;

    const property = await propertyService.updateProperty(ownerId, propertyId, req.body);
    res.json({ message: "Property updated successfully", property });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Server Error", error });
  }
};

//delete property
module.exports.deleteProperty = async (req, res) => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      return res.status(401).json({ message: "Unauthorized: no user in token" });
    }
    const propertyId = req.params.id;

    const result = await propertyService.deleteProperty(ownerId, propertyId);
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Server Error", error });
  }
};

//get all the properties for the owner
module.exports.getAllPropertyByOwner = async (req, res) => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      return res.status(401).json({ message: "Unauthorized: no user in token" });
    }

    const properties = await propertyService.getOwnerProperties(ownerId);
    return res.status(200).json(properties);
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message || "Server Error", error });
  }
};

//get all Property
module.exports.getAllPorperties = async (req, res) => {
  try {
    const properties = await propertyService.getAllProperties();
    res.json(properties);
  } catch (error) {
    return res.status(500).json({ message: "Server Error", error });
  }
};
