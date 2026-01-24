const Lease = require('../models/leaseSchema');
const Unit = require('../models/unitSchema');
const AppError = require('../utils/AppError');
const { LEASE_STATUS, TERMINATION_STATUS, UNIT_STATUS } = require('../utils/constants');
const unitService = require('./unitService');

class LeaseService {
    async findById(id) {
        return Lease.findById(id);
    }

    async findByTenant(tenantId) {
        return Lease.find({ tenantId });
    }

    async findByOwner(ownerId) {
        return Lease.find({ ownerId });
    }

    async findActiveLeases() {
        return Lease.find({ status: LEASE_STATUS.ACTIVE });
    }

    async createLease(leaseData) {
        const { unitId, tenantId, ownerId, startDate, endDate, rentAmount, depositAmount } = leaseData;

        const unit = await unitService.findById(unitId);
        if (!unit) {
            throw new AppError('Unit not found', 404);
        }

        if (unit.status === UNIT_STATUS.OCCUPIED) {
            throw new AppError('Unit already occupied', 400);
        }

        const lease = new Lease({
            unitId,
            tenantId,
            ownerId,
            startDate: startDate || new Date(),
            endDate: endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            rentAmount: rentAmount || unit.rentAmount,
            depositAmount: depositAmount || unit.depositAmount || 0,
            status: LEASE_STATUS.ACTIVE
        });

        await lease.save();
        await unitService.markAsOccupied(unitId);

        return lease;
    }

    async signLease(leaseId, tenantId) {
        const lease = await this.findById(leaseId);
        if (!lease) {
            throw new AppError('Lease not found', 404);
        }

        lease.status = LEASE_STATUS.ACTIVE;
        await lease.save();
        return lease;
    }

    async requestTermination(leaseId, tenantId, reason) {
        const lease = await this.findById(leaseId);
        if (!lease) {
            throw new AppError('Lease not found', 404);
        }

        if (String(lease.tenantId) !== String(tenantId)) {
            throw new AppError('You can only request termination of your own lease', 403);
        }

        if (lease.status !== LEASE_STATUS.ACTIVE) {
            throw new AppError('Only ACTIVE leases can be requested to terminate', 400);
        }

        if (lease.termination && lease.termination.status === TERMINATION_STATUS.REQUESTED) {
            throw new AppError('You already have a pending termination request', 400);
        }

        lease.termination = {
            status: TERMINATION_STATUS.REQUESTED,
            reason: reason || '',
            requestedBy: tenantId,
            requestedAt: new Date()
        };

        await lease.save();
        return lease;
    }

    async reviewTermination(leaseId, ownerId, decision) {
        const lease = await this.findById(leaseId);
        if (!lease) {
            throw new AppError('Lease not found', 404);
        }

        if (String(lease.ownerId) !== String(ownerId)) {
            throw new AppError('You can only review terminations for your own leases', 403);
        }

        if (!lease.termination || lease.termination.status !== TERMINATION_STATUS.REQUESTED) {
            throw new AppError('No pending termination request for this lease', 400);
        }

        lease.termination.reviewedBy = ownerId;
        lease.termination.reviewedAt = new Date();

        if (decision === 'APPROVE') {
            lease.termination.status = TERMINATION_STATUS.APPROVED;
            lease.status = LEASE_STATUS.TERMINATED;
            await lease.save();
            await unitService.markAsAvailable(lease.unitId);
            return { lease, message: 'Termination approved. Lease ended and unit freed.' };
        }

        lease.termination.status = TERMINATION_STATUS.REJECTED;
        await lease.save();
        return { lease, message: 'Termination request rejected. Lease remains ACTIVE.' };
    }
}

module.exports = new LeaseService();
