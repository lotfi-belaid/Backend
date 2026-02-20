const bcrypt = require("bcrypt");
const User = require("../models/userSchema");
const Property = require("../models/propertySchema");
const Unit = require("../models/unitSchema");
const Lease = require("../models/leaseSchema");
const Invoice = require("../models/invoiceSchema");
const Maintenance = require("../models/maintenanceSchema");
//add property
module.exports.addProperty = async (req, res) => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: no user in token" });
    }

    const { name, address, city, postalCode } = req.body;
    const owner = await User.findById(ownerId);

    if (!owner || owner.role !== "OWNER")
      return res
        .status(403)
        .json({ message: "Only owners can add properties" });

    // Prevent banned or unapproved owners
    if (owner.isBanned)
      return res.status(403).json({ message: "Your account is banned" });
    if (!owner.isApproved)
      return res
        .status(403)
        .json({ message: "Your account is not approved yet" });

    const property = new Property({ ownerId, name, address, city, postalCode });
    await property.save();
    //increment owner's total properties count
    owner.ownerTotalProperties = (owner.ownerTotalProperties ?? 0) + 1;
    await owner.save();

    res
      .status(201)
      .json({ message: "Property created successfully", property });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
//update property details
module.exports.updateProperty = async (req, res) => {
  try {
    const ownerId = req.user?.id;

    if (!ownerId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: no user in token" });
    }
    const { propertyId, name, address, city, postalCode, description } =
      req.body;

    // Validate owner
    const owner = await User.findById(ownerId);
    if (!owner || owner.role !== "OWNER")
      return res
        .status(403)
        .json({ message: "Only owners can update properties" });

    if (owner.isBanned)
      return res.status(403).json({ message: "Your account is banned" });

    if (!owner.isApproved)
      return res
        .status(403)
        .json({ message: "Your account is not approved yet" });

    // Check property
    const property = await Property.findById(propertyId);
    if (!property)
      return res.status(404).json({ message: "Property not found" });

    // Check if this owner owns the property
    if (String(property.ownerId) !== String(ownerId))
      return res
        .status(403)
        .json({ message: "You can only update your own properties" });

    // Update the property fields only if provided
    if (name) property.name = name;
    if (address) property.address = address;
    if (city) property.city = city;
    if (postalCode) property.postalCode = postalCode;
    if (description) property.description = description;

    await property.save();

    res.json({
      message: "Property updated successfully",
      property,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
//delete property
module.exports.deleteProperty = async (req, res) => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId)
      return res
        .status(401)
        .json({ message: "Unauthorized: no user in token" });
    const { propertyId } = req.body;

    const owner = await User.findById(ownerId);
    if (!owner || owner.role !== "OWNER")
      return res
        .status(403)
        .json({ message: "Only owners can delete properties" });
    if (owner.isBanned)
      return res.status(403).json({ message: "Your account is banned" });
    if (!owner.isApproved)
      return res
        .status(403)
        .json({ message: "Your account is not approved yet" });
    const property = await Property.findById(propertyId);
    if (!property)
      return res.status(404).json({ message: "Property not found" });

    if (String(property.ownerId) !== String(ownerId))
      return res
        .status(403)
        .json({ message: "You can only delete your own properties" });

    await property.deleteOne();
    res.json({ message: "Property deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

//get all the properties for the owner
module.exports.getAllPropertyByOwner = async (req, res) => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId)
      return res
        .status(401)
        .json({ message: "Unauthorized: no user in token" });
    const owner = await User.findById(ownerId);
    if (!owner || owner.role !== "OWNER")
      return res
        .status(403)
        .json({ message: "only owners can see own Properties" });
    if (owner.isBanned)
      return res.status(403).json({ message: "your account is banned " });
    if (!owner.isApproved)
      return res
        .status(403)
        .json({ message: "your account is not approved yet" });
    const properties = await Property.find({ ownerId });
    return res.status(200).json(properties);
  } catch (error) {
    return res.status(500).json({ message: "Server Error", error });
  }
};
//get all Property
module.exports.getAllPorperties = async (req, res) => {
  try {
    const properties = await Property.find();
    res.json(properties);
  } catch {
    return res.status(500).json({ message: "Server Error" });
  }
};
//add unit to property
module.exports.addUnit = async (req, res) => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId)
      return res
        .status(401)
        .json({ message: "Unauthorized: no user in token" });
    const {
      propertyId,
      unitNumber,
      bedrooms,
      areaM2,
      rentAmount,
      depositAmount,
    } = req.body;
    const owner = await User.findById(ownerId);
    if (!owner || owner.role !== "OWNER")
      return res.status(403).json({ message: "Only owners can add units" });
    if (owner.isBanned)
      return res.status(403).json({ message: "Your account is banned" });
    if (!owner.isApproved)
      return res
        .status(403)
        .json({ message: "Your account is not approved yet" });
    const property = await Property.findById(propertyId);
    if (!property)
      return res.status(404).json({ message: "Property not found" });

    if (String(property.ownerId) !== String(ownerId))
      return res
        .status(403)
        .json({ message: "You can only add units to your own properties" });
    const unit = new Unit({
      propertyId,
      unitNumber,
      bedrooms,
      areaM2,
      rentAmount,
      depositAmount,
      status: "AVAILABLE",
    });
    await unit.save();
    res.status(201).json({ message: "Unit added successfully", unit });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
//update Unit
module.exports.updateUnitById = async (req, res) => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId)
      return res
        .status(401)
        .json({ message: "Unauthorized: no user in token" });
    const { unitId } = req.params;
    const {
      propertyId,
      unitNumber,
      bedrooms,
      bathrooms,
      areaM2,
      rentAmount,
      depositAmount,
      status,
    } = req.body;
    const owner = await User.findById(ownerId);
    if (!owner || owner.role !== "OWNER")
      return res
        .status(403)
        .json({ message: "only owner can update the units" });
    if (owner.isBanned)
      return res.status(403).json({ message: "your account is banned" });
    if (!owner.isApproved)
      return res
        .status(403)
        .json({ message: "your account is not approved yet" });
    const property = await Property.findById(propertyId);
    if (!property)
      return res.status(404).json({ message: "Property not found" });
    const unit = await Unit.findById(unitId);
    if (!unit) return res.status(404).json({ message: "Unit not found" });
    if (String(property.ownerId) !== String(ownerId))
      return res
        .status(403)
        .json({ message: "you can only update your own Properties" });
    if (String(unit.propertyId) !== String(propertyId))
      return res
        .status(403)
        .json({
          message: "you can only update units belonging to this property",
          property,
        });
    if (unitNumber !== undefined) unit.unitNumber = unitNumber;
    if (bedrooms !== undefined) unit.bedrooms = bedrooms;
    if (bathrooms !== undefined) unit.bathrooms = bathrooms;
    if (areaM2 !== undefined) unit.areaM2 = areaM2;
    if (rentAmount !== undefined) unit.rentAmount = rentAmount;
    if (depositAmount !== undefined) unit.depositAmount = depositAmount;
    if (status !== undefined) unit.status = status;
    await unit.save();
    res.json({ message: "unit updated successfully", unit });
  } catch (error) {
    return res.status(500).json({ message: "Server Error", error });
  }
};
//delete unit
module.exports.deleteUnit = async (req, res) => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId)
      return res
        .status(401)
        .json({ message: "Unauthorized: no user in token" });
    const { unitId } = req.params;
    const { propertyId } = req.body;
    const owner = await User.findById(ownerId);
    if (!owner || owner.role !== "OWNER")
      return res.status(403).json({ message: "only owner can delete units" });
    if (owner.isBanned)
      return res.status(403).json({ message: "your account is banned" });
    if (!owner.isApproved)
      return res
        .status(403)
        .json({ message: "your account is not approved yet" });
    const property = await Property.findById(propertyId);
    if (!property)
      return res.status(404).json({ message: "property not found" });
    if (String(property.ownerId) !== String(ownerId))
      return res
        .status(403)
        .json({ message: "you can only delete units in your own property" });
    const unit = await Unit.findById(unitId);
    if (!unit) return res.status(404).json({ message: "unit not found" });
    if (String(unit.propertyId) !== String(propertyId))
      return res
        .status(403)
        .json({
          message: "you can only delete units belongs to this property",
          property,
        });
    await unit.deleteOne();
    res.json({ message: "unit deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server Error" });
  }
};
//get all units for specific property
module.exports.getAllUnitByProperty = async (req, res) => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId)
      return res
        .status(401)
        .json({ message: "Unauthorized: no user in token" });
    const { propertyId } = req.params;
    const property = await Property.findById(propertyId);
    if (!property)
      return res.status(404).json({ message: "Property not found" });
    const units = await Unit.find({ propertyId });
    if (!units) return res.status(404).json({ message: "Units not found" });
    res.status(200).json(units);
  } catch (error) {
    return res.status(500).json({ message: "Server Error" });
  }
};
//get All units
module.exports.getAllUnits = async (req, res) => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId)
      return res
        .status(401)
        .json({ message: "Unauthorized: no user in token" });
    const units = await Unit.find();
    res.json(units);
  } catch {
    return res.status(500).json({ message: "Server Error" });
  }
};

// Approve tenant application (and then creates lease automatically)
module.exports.approveApplication = async (req, res) => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId)
      return res
        .status(401)
        .json({ message: "Unauthorized: no user in token" });
    const { tenantId, unitId, leaseStartDate, leaseEndDate, rentAmount } =
      req.body;

    const owner = await User.findById(ownerId);
    if (!owner || owner.role !== "OWNER")
      return res
        .status(403)
        .json({ message: "Only owners can approve applications" });

    if (owner.isBanned)
      return res.status(403).json({ message: "Your account is banned" });

    if (!owner.isApproved)
      return res
        .status(403)
        .json({ message: "Your account is not approved yet" });

    const tenant = await User.findById(tenantId);
    if (!tenant || tenant.role !== "TENANT")
      return res.status(400).json({ message: "Invalid tenant ID" });

    const unit = await Unit.findById(unitId);
    if (!unit) return res.status(404).json({ message: "Unit not found" });

    if (unit.status === "OCCUPIED")
      return res.status(400).json({ message: "Unit already occupied" });

    // Create lease
    const lease = new Lease({
      unitId,
      tenantId,
      ownerId,
      startDate: leaseStartDate || new Date(),
      endDate: leaseEndDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // default 1 year
      rentAmount: rentAmount || unit.rentAmount,
      depositAmount: unit.depositAmount || 0,
      status: "ACTIVE",
    });

    await lease.save();

    // Mark unit as occupied
    unit.status = "OCCUPIED";
    await unit.save();

    res.status(201).json({
      message: `Tenant ${tenant.name}'s application approved and lease created.`,
      lease,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
//approve or terminate lease termination request
module.exports.reviewLeaseTermination = async (req, res) => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId)
      return res
        .status(401)
        .json({ message: "Unauthorized: no user in token" });
    const { leaseId, decision } = req.body;

    const lease = await Lease.findById(leaseId);
    if (!lease) return res.status(404).json({ message: "Lease not found" });

    if (String(lease.ownerId) !== String(ownerId))
      return res
        .status(403)
        .json({
          message: "You can only review terminations for your own leases",
        });

    if (!lease.termination || lease.termination.status !== "REQUESTED")
      return res
        .status(400)
        .json({ message: "No pending termination request for this lease" });

    lease.termination.reviewedBy = ownerId;
    lease.termination.reviewedAt = new Date();

    if (decision === "APPROVE") {
      lease.termination.status = "APPROVED";
      lease.status = "TERMINATED";
      await lease.save();

      // Free the unit when termination is approved
      await Unit.findByIdAndUpdate(lease.unitId, { status: "AVAILABLE" });

      return res.json({
        message: "Termination approved. Lease ended and unit freed.",
        lease,
      });
    }

    // Reject
    lease.termination.status = "REJECTED";
    await lease.save();

    res.json({
      message: "Termination request rejected. Lease remains ACTIVE.",
      lease,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error });
  }
};
// assign vendor to maintenance task
module.exports.assignVendor = async (req, res) => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId)
      return res
        .status(401)
        .json({ message: "Unauthorized: no user in token" });
    const { vendorId, maintenanceId } = req.body;
    const vendor = await User.findById(vendorId);
    const maintenance = await Maintenance.findById(maintenanceId);

    if (!vendor || vendor.role !== "VENDOR")
      return res.status(400).json({ message: "Invalid vendor ID" });

    if (vendor.isBanned)
      return res.status(403).json({ message: "Vendor account is banned" });
    if (!vendor.isApproved)
      return res
        .status(403)
        .json({ message: "Vendor account not yet approved" });

    if (!maintenance)
      return res.status(404).json({ message: "Maintenance not found" });
    // Assign vendor
    maintenance.vendorId = vendorId;
    await maintenance.save();

    res.json({
      message: `Vendor ${vendor.name} assigned successfully`,
      maintenance,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
//view Payments
module.exports.viewPayments = async (req, res) => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId)
      return res
        .status(401)
        .json({ message: "Unauthorized: no user in token" });
    const ownerLeases = await Lease.find({ ownerId }).select("_id");
    const leaseIds = ownerLeases.map((leaseDoc) => leaseDoc._id);
    // Fetch all invoices and populate tenant details
    const invoices = await Invoice.find({ leaseId: { $in: leaseIds } })
      .populate({
        path: "leaseId",
        select: "tenantId",
        populate: { path: "tenantId", select: "name email" },
      })
      .sort({ dueDate: -1 }); // sort by most recent first

    // If there are no invoices
    if (invoices.length === 0) {
      return res.status(404).json({ message: "No payments found." });
    }

    // Format the response
    res.status(200).json({
      message: "Payments fetched successfully.",
      payments: invoices.map((inv) => ({
        id: inv._id,
        tenant: inv.leaseId?.tenantId
          ? inv.leaseId.tenantId.name
          : "Unknown Tenant",
        email: inv.leaseId?.tenantId ? inv.leaseId.tenantId.email : "No email",
        amount: inv.amount,
        status: inv.status,
        dueDate: inv.dueDate,
        paidDate: inv.paidDate || null,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
