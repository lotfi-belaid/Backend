const bcrypt = require('bcrypt');
const User = require('../models/userSchema');
const Property = require('../models/propertySchema');
const Unit = require('../models/unitSchema');
const Lease = require('../models/leaseSchema');
const Invoice = require('../models/invoiceSchema');
const Maintenance = require('../models/maintenanceSchema');
//acceptJob
module.exports.acceptJob = async (req, res) => {
    try {
        const vendorId = req.user?.id;
        const { maintenanceId } = req.body;
        if (!vendorId) return res.status(401).json({ message: "Unauthorized: no user in token" });
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
        if (maintenance.vendorId && String(maintenance.vendorId) !== String(vendorId))
            return res.status(403).json({ message: 'This job is assigned to another vendor' });
        maintenance.vendorId = vendorId;
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
        const vendorId = req.user?.id;
        if (!vendorId) return res.status(401).json({ message: "Unauthorized: no user in token" });
        const { maintenanceId, description, cost } = req.body;

        const vendor = await User.findById(vendorId);
        if (!vendor || vendor.role !== 'VENDOR')
            return res.status(403).json({ message: 'Only vendors can submit repair reports' });
        if (vendor.isBanned)
            return res.status(403).json({ message: 'Your account is banned' });
        if (!vendor.isApproved)
            return res.status(403).json({ message: 'Your account is not approved yet' });

        const maintenance = await Maintenance.findById(maintenanceId);
        if (!maintenance)
            return res.status(404).json({ message: 'Maintenance not found' });
        if (String(maintenance.vendorId) !== String(vendorId))
            return res.status(403).json({ message: 'You can only report your assigned jobs' });

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
