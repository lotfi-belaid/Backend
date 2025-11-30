const bcrypt = require('bcrypt');
const User = require('../models/userSchema');
const Property = require('../models/propertySchema');
const Unit = require('../models/unitSchema');
const Lease = require('../models/leaseSchema');
const Invoice = require('../models/invoiceSchema');
const Maintenance = require('../models/maintenanceSchema');


/*Admin Functions*/

//ban user
module.exports.banUser = async (req, res) => {
    try {
        const user = await userModel.findById(req.params.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.isBanned = true;
        await user.save();

        res.json({ message: `User ${user.name} banned successfully`, user });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
// Approve user
module.exports.approveUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.isApproved = true;
        await user.save();

        res.json({ message: `User ${user.name} approved successfully`, user });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
// view Dashboard Stats
module.exports.viewDashboard = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const admins = await User.countDocuments({ role: 'ADMIN' });
        const owners = await User.countDocuments({ role: 'OWNER' });
        const tenants = await User.countDocuments({ role: 'TENANT' });
        const vendors = await User.countDocuments({ role: 'VENDOR' });

        const totalProperties = await Property.countDocuments();
        const totalLeases = await Lease.countDocuments({ status: 'ACTIVE' });
        const totalMaintenance = await Maintenance.countDocuments();
        const pendingApprovals = await User.countDocuments({ isApproved: false });

        const invoicesPaid = await Invoice.countDocuments({ status: 'PAID' });
        const invoicesPending = await Invoice.countDocuments({ status: 'PENDING' });

        res.json({
            message: 'Dashboard summary fetched successfully',
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
        res.status(500).json({ message: 'Error fetching dashboard data', error });
    }
};
/*Owner Functions*/
//add property
module.exports.addProperty = async (req, res) => {
    try {
        const { ownerId, name, address, city, postalCode } = req.body;
        const owner = await User.findById(ownerId);

        if (!owner || owner.role !== 'OWNER')
            return res.status(403).json({ message: 'Only owners can add properties' });

        // Prevent banned or unapproved owners
        if (owner.isBanned)
            return res.status(403).json({ message: 'Your account is banned' });
        if (!owner.isApproved)
            return res.status(403).json({ message: 'Your account is not approved yet' });

        const property = new Property({ ownerId, name, address, city, postalCode });
        await property.save();

        res.status(201).json({ message: 'Property created successfully', property });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
// assign vendor to maintenance task
module.exports.assignVendor = async (req, res) => {
    try {
        const { vendorId, maintenanceId } = req.body;
        const vendor = await User.findById(vendorId);
        const maintenance = await Maintenance.findById(maintenanceId);

        if (!vendor || vendor.role !== 'VENDOR')
            return res.status(400).json({ message: 'Invalid vendor ID' });

        if (vendor.isBanned)
            return res.status(403).json({ message: 'Vendor account is banned' });
        if (!vendor.isApproved)
            return res.status(403).json({ message: 'Vendor account not yet approved' });

        if (!maintenance)
            return res.status(404).json({ message: 'Maintenance not found' });
        // Assign vendor
        maintenance.vendorId = vendorId;
        await maintenance.save();

        res.json({ message: `Vendor ${vendor.name} assigned successfully`, maintenance });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
//view Payments
module.exports.viewPayments = async (req, res) => {
    try {
        // Fetch all invoices and populate tenant details
        const invoices = await Invoice.find()
            .populate('tenantId', 'name email') // shows tenant name and email
            .sort({ dueDate: -1 }); // sort by most recent first

        // If there are no invoices
        if (invoices.length === 0) {
            return res.status(404).json({ message: 'No payments found.' });
        }

        // Format the response
        res.status(200).json({
            message: 'Payments fetched successfully.',
            payments: invoices.map(inv => ({
                id: inv._id,
                tenant: inv.tenantId ? inv.tenantId.name : 'Unknown Tenant',
                email: inv.tenantId ? inv.tenantId.email : 'No email',
                amount: inv.amount,
                status: inv.status,
                dueDate: inv.dueDate,
                paidDate: inv.paidDate || null,
            })),
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
//update property details
module.exports.updateProperty = async (req, res) => {
    try {
        const { ownerId, propertyId, name, address, city, postalCode, description } = req.body;

        // Validate owner
        const owner = await User.findById(ownerId);
        if (!owner || owner.role !== 'OWNER')
            return res.status(403).json({ message: 'Only owners can update properties' });

        if (owner.isBanned)
            return res.status(403).json({ message: 'Your account is banned' });

        if (!owner.isApproved)
            return res.status(403).json({ message: 'Your account is not approved yet' });

        // Check property
        const property = await Property.findById(propertyId);
        if (!property)
            return res.status(404).json({ message: 'Property not found' });

        // Check if this owner owns the property
        if (String(property.ownerId) !== String(ownerId))
            return res.status(403).json({ message: 'You can only update your own properties' });

        // Update the property fields only if provided
        if (name) property.name = name;
        if (address) property.address = address;
        if (city) property.city = city;
        if (postalCode) property.postalCode = postalCode;
        if (description) property.description = description;

        await property.save();

        res.json({
            message: 'Property updated successfully',
            property,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
//delete property
module.exports.deleteProperty = async (req, res) => {
    try {
        const { ownerId, propertyId } = req.body;

        const owner = await User.findById(ownerId);
        if (owner.isBanned)
            return res.status(403).json({ message: 'Your account is banned' });
        if (!owner.isApproved)
            return res.status(403).json({ message: 'Your account is not approved yet' });
        if (!owner || owner.role !== 'OWNER')
            return res.status(403).json({ message: 'Only owners can delete properties' });

        const property = await Property.findById(propertyId);
        if (!property) return res.status(404).json({ message: 'Property not found' });

        if (String(property.ownerId) !== String(ownerId))
            return res.status(403).json({ message: 'You can only delete your own properties' });

        await property.deleteOne();
        res.json({ message: 'Property deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
//add unit to property
module.exports.addUnit = async (req, res) => {
    try {
        const { ownerId, propertyId, unitNumber } = req.body;
        const owner = await User.findById(ownerId);
        if (owner.isBanned)
            return res.status(403).json({ message: 'Your account is banned' });
        if (!owner.isApproved)
            return res.status(403).json({ message: 'Your account is not approved yet' });
        if (!owner || owner.role !== 'OWNER')
            return res.status(403).json({ message: 'Only owners can delete properties' });

        const property = await Property.findById(propertyId);
        if (!property) return res.status(404).json({ message: 'Property not found' });

        if (String(property.ownerId) !== String(ownerId))
            return res.status(403).json({ message: 'You can only delete your own properties' });
        const unit = new Unit({
            propertyId,
            unitNumber,
            bedrooms,
            areaM2,
            rentAmount,
            depositAmount,
            status: 'AVAILABLE'
        });
        await unit.save();
        res.status(201).json({ message: 'Unit added successfully', unit });


    }
    catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
// Approve tenant application (and then creates lease automatically)
module.exports.approveApplication = async (req, res) => {
    try {
        const { ownerId, tenantId, unitId, leaseStartDate, leaseEndDate, rentAmount } = req.body;

        const owner = await User.findById(ownerId);
        if (!owner || owner.role !== 'OWNER')
            return res.status(403).json({ message: 'Only owners can approve applications' });

        if (owner.isBanned)
            return res.status(403).json({ message: 'Your account is banned' });

        if (!owner.isApproved)
            return res.status(403).json({ message: 'Your account is not approved yet' });

        const tenant = await User.findById(tenantId);
        if (!tenant || tenant.role !== 'TENANT')
            return res.status(400).json({ message: 'Invalid tenant ID' });

        const unit = await Unit.findById(unitId);
        if (!unit) return res.status(404).json({ message: 'Unit not found' });

        if (unit.status === 'OCCUPIED')
            return res.status(400).json({ message: 'Unit already occupied' });

        // Create lease
        const lease = new Lease({
            unitId,
            tenantId,
            ownerId,
            startDate: leaseStartDate || new Date(),
            endDate: leaseEndDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // default 1 year
            rentAmount: rentAmount || unit.rentAmount,
            depositAmount: unit.depositAmount || 0,
            status: 'ACTIVE',
        });

        await lease.save();

        // Mark unit as occupied
        unit.status = 'OCCUPIED';
        await unit.save();

        res.status(201).json({
            message: `Tenant ${tenant.name}'s application approved and lease created.`,
            lease,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
//approve or terminate lease termination request
module.exports.reviewLeaseTermin = async (req, res) => {
    try {
        const { ownerId, leaseId, decision } = req.body;

        const lease = await Lease.findById(leaseId);
        if (!lease) return res.status(404).json({ message: 'Lease not found' });

        if (String(lease.ownerId) !== String(ownerId))
            return res.status(403).json({ message: 'You can only review terminations for your own leases' });

        if (lease.termination.status !== 'REQUESTED')
            return res.status(400).json({ message: 'No pending termination request for this lease' });


        lease.termination.reviewedBy = ownerId;
        lease.termination.reviewedAt = new Date();

        if (decision === 'APPROVE') {
            lease.termination.status = 'APPROVED';
            lease.status = 'TERMINATED';
            await lease.save();

            // Free the unit when termination is approved
            await Unit.findByIdAndUpdate(lease.unitId, { status: 'AVAILABLE' });

            return res.json({ message: 'Termination approved. Lease ended and unit freed.', lease });
        }

        // Reject
        lease.termination.status = 'REJECTED';
        await lease.save();

        res.json({ message: 'Termination request rejected. Lease remains ACTIVE.', lease });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error });
    }
};
/* Tenant Functions */
//apply for Unit
module.exports.applyForUnit = async (req, res) => {
    try {
        const { tenantId, unitId } = req.body;
        const tenant = await User.findById(tenantId);
        const unit = await Unit.findById(unitId);

        if (!tenant || tenant.role !== 'TENANT')
            return res.status(403).json({ message: 'Only tenants can apply for units' });

        if (tenant.isBanned)
            return res.status(403).json({ message: 'Your account is banned' });
        if (!tenant.isApproved)
            return res.status(403).json({ message: 'Your account is not approved yet' });

        if (!unit || unit.status !== 'AVAILABLE')
            return res.status(400).json({ message: 'Unit not available' });

        res.status(201).json({ message: `Tenant ${tenant.name} applied for unit #${unitId}` });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
//sign Lease
module.exports.signLease = async (req, res) => {
    try {
        const { tenantId, leaseId } = req.body;
        const tenant = await User.findById(tenantId);
        const lease = await Lease.findById(leaseId);

        if (!tenant || tenant.role !== 'TENANT')
            return res.status(403).json({ message: 'Only tenants can sign leases' });
        if (tenant.isBanned)
            return res.status(403).json({ message: 'Your account is banned' });
        if (!tenant.isApproved)
            return res.status(403).json({ message: 'Your account is not approved yet' });
        if (!lease)
            return res.status(404).json({ message: 'Lease not found' });
        lease.status = 'ACTIVE';
        await lease.save();

        res.json({ message: `Lease #${leaseId} signed successfully by ${tenant.name}`, lease });

    }
    catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }


};
//pay Invoice
module.exports.payInvoice = async (req, res) => {
    try {
        const { tenantId, invoiceId } = req.body;
        const tenant = await User.findById(tenantId);
        const invoice = await Invoice.findById(invoiceId);
        if (!tenant || tenant.role !== 'TENANT')
            return res.status(403).json({ message: 'Only tenants can pay invoices' });
        if (tenant.isBanned)
            return res.status(403).json({ message: 'Your account is banned' });
        if (!tenant.isApproved)
            return res.status(403).json({ message: 'Your account is not approved yet' });
        if (!invoice)
            return res.status(404).json({ message: 'Invoice not found' });
        invoice.status = 'PAID';
        invoice.paidAt = new Date();
        await invoice.save();
        res.json({ message: `Invoice #${invoiceId} paid successfully by ${tenant.name}`, invoice });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
//request Lease Termination
module.exports.requestLeaseTermination = async (req, res) => {
    try {
        const { tenantId, leaseId, reason } = req.body;

        const lease = await Lease.findById(leaseId);
        if (!lease) return res.status(404).json({ message: 'Lease not found' });

        if (String(lease.tenantId) !== String(tenantId))
            return res.status(403).json({ message: 'You can only request termination of your own lease' });

        if (lease.status !== 'ACTIVE')
            return res.status(400).json({ message: 'Only ACTIVE leases can be requested to terminate' });

        if (lease.termination.status === 'REQUESTED')
            return res.status(400).json({ message: 'You already have a pending termination request' });

        lease.termination = {
            status: 'REQUESTED',
            reason: reason || '',
            requestedBy: tenantId,
            requestedAt: new Date()
        };

        await lease.save();
        res.json({ message: 'Termination requested. Owner will review.', lease });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error });
    }
};
/*Vendor Functions */

//acceptJob
module.exports.acceptJob = async (req, res) => {
    try {
        const { vendorId, maintenanceId } = req.body;
        const vendor = await User.findById(vendorId);
        const maintenance = await Maintenance.findById(maintenanceId);

        if (!vendor || vendor.role !== 'VENDOR')
            return res.status(403).json({ message: 'Only vendors can accept jobs' });
        if (vendor.isBanned)
            return res.status(403).json({ message: 'Your account is banned' });
        if (!vendor.isApproved)
            return res.status(403).json({ message: 'Your account is not approved yet' });
        if (!maintenance)
            return res.status(404).json({ message: 'Maintenance job not found' });
        maintenance.status = 'IN_PROGRESS';
        await maintenance.save();

        res.json({ message: `Maintenance job #${maintenanceId} accepted successfully by ${vendor.name}`, maintenance });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
//add Repair Report and Mark as Done
module.exports.addRepairReport = async (req, res) => {
    try {
        const { maintenanceId, description, cost } = req.body;

        const maintenance = await Maintenance.findById(maintenanceId);
        if (!maintenance)
            return res.status(404).json({ message: 'Maintenance not found' });

        maintenance.report = {
            description,
            cost,
            submittedAt: new Date()
        };
        maintenance.status = 'DONE';
        await maintenance.save();

        res.json({
            message: 'Repair report submitted successfully',
            maintenance
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};



