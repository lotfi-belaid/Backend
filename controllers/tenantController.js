const bcrypt = require('bcrypt');
const User = require('../models/userSchema');
const Property = require('../models/propertySchema');
const Unit = require('../models/unitSchema');
const Lease = require('../models/leaseSchema');
const Invoice = require('../models/invoiceSchema');
const Maintenance = require('../models/maintenanceSchema');
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

        if (lease.termination && lease.termination.status === 'REQUESTED')
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