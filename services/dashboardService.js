const User = require('../models/userSchema');
const Property = require('../models/propertySchema');
const Lease = require('../models/leaseSchema');
const Invoice = require('../models/invoiceSchema');
const Maintenance = require('../models/maintenanceSchema');

class DashboardService {
    async getStats() {
        const [
            totalUsers,
            admins,
            owners,
            tenants,
            vendors,
            totalProperties,
            totalLeases,
            totalMaintenance,
            pendingApprovals,
            invoicesPaid,
            invoicesPending
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: 'ADMIN' }),
            User.countDocuments({ role: 'OWNER' }),
            User.countDocuments({ role: 'TENANT' }),
            User.countDocuments({ role: 'VENDOR' }),
            Property.countDocuments(),
            Lease.countDocuments({ status: 'ACTIVE' }),
            Maintenance.countDocuments(),
            User.countDocuments({ isApproved: false }),
            Invoice.countDocuments({ status: 'PAID' }),
            Invoice.countDocuments({ status: 'PENDING' })
        ]);

        return {
            users: { totalUsers, admins, owners, tenants, vendors },
            properties: totalProperties,
            leases: totalLeases,
            maintenance: totalMaintenance,
            pendingApprovals,
            invoices: { paid: invoicesPaid, pending: invoicesPending }
        };
    }
}

module.exports = new DashboardService();
