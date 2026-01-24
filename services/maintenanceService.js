const Maintenance = require('../models/maintenanceSchema');
const AppError = require('../utils/AppError');
const { MAINTENANCE_STATUS } = require('../utils/constants');

class MaintenanceService {
    async findById(id) {
        return Maintenance.findById(id);
    }

    async findAll() {
        return Maintenance.find();
    }

    async findByVendor(vendorId) {
        return Maintenance.find({ vendorId });
    }

    async findByUnit(unitId) {
        return Maintenance.find({ unitId });
    }

    async assignVendor(maintenanceId, vendorId) {
        const maintenance = await this.findById(maintenanceId);
        if (!maintenance) {
            throw new AppError('Maintenance not found', 404);
        }

        maintenance.vendorId = vendorId;
        await maintenance.save();
        return maintenance;
    }

    async acceptJob(maintenanceId) {
        const maintenance = await this.findById(maintenanceId);
        if (!maintenance) {
            throw new AppError('Maintenance job not found', 404);
        }

        maintenance.status = MAINTENANCE_STATUS.IN_PROGRESS;
        await maintenance.save();
        return maintenance;
    }

    async addReport(maintenanceId, description, cost) {
        const maintenance = await this.findById(maintenanceId);
        if (!maintenance) {
            throw new AppError('Maintenance not found', 404);
        }

        maintenance.report = {
            description,
            cost,
            submittedAt: new Date()
        };
        maintenance.status = MAINTENANCE_STATUS.DONE;
        await maintenance.save();
        return maintenance;
    }
}

module.exports = new MaintenanceService();
