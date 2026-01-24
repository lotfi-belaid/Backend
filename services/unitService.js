const Unit = require('../models/unitSchema');
const Property = require('../models/propertySchema');
const AppError = require('../utils/AppError');
const { UNIT_STATUS } = require('../utils/constants');

class UnitService {
    async findById(id) {
        return Unit.findById(id);
    }

    async findAll() {
        return Unit.find();
    }

    async findByProperty(propertyId) {
        return Unit.find({ propertyId });
    }

    async findAvailable() {
        return Unit.find({ status: UNIT_STATUS.AVAILABLE });
    }

    async searchByRentAmount(sortOrder = 1) {
        return Unit.find().sort({ rentAmount: sortOrder });
    }

    async createUnit(propertyId, ownerId, unitData) {
        // Verify property ownership
        const property = await Property.findById(propertyId);
        if (!property) {
            throw new AppError('Property not found', 404);
        }

        if (String(property.ownerId) !== String(ownerId)) {
            throw new AppError('You can only add units to your own properties', 403);
        }

        const unit = new Unit({
            ...unitData,
            propertyId,
            status: UNIT_STATUS.AVAILABLE
        });
        await unit.save();
        return unit;
    }

    async updateUnit(unitId, propertyId, ownerId, updateData) {
        // Verify property ownership
        const property = await Property.findById(propertyId);
        if (!property) {
            throw new AppError('Property not found', 404);
        }

        if (String(property.ownerId) !== String(ownerId)) {
            throw new AppError('You can only update your own properties', 403);
        }

        const unit = await this.findById(unitId);
        if (!unit) {
            throw new AppError('Unit not found', 404);
        }

        if (String(unit.propertyId) !== String(propertyId)) {
            throw new AppError('Unit does not belong to this property', 403);
        }

        Object.keys(updateData).forEach(key => {
            if (updateData[key] !== undefined) {
                unit[key] = updateData[key];
            }
        });

        await unit.save();
        return unit;
    }

    async deleteUnit(unitId, propertyId, ownerId) {
        // Verify property ownership
        const property = await Property.findById(propertyId);
        if (!property) {
            throw new AppError('Property not found', 404);
        }

        if (String(property.ownerId) !== String(ownerId)) {
            throw new AppError('You can only delete units in your own property', 403);
        }

        const unit = await this.findById(unitId);
        if (!unit) {
            throw new AppError('Unit not found', 404);
        }

        if (String(unit.propertyId) !== String(propertyId)) {
            throw new AppError('Unit does not belong to this property', 403);
        }

        await unit.deleteOne();
        return unit;
    }

    async markAsOccupied(unitId) {
        return Unit.findByIdAndUpdate(unitId, { status: UNIT_STATUS.OCCUPIED }, { new: true });
    }

    async markAsAvailable(unitId) {
        return Unit.findByIdAndUpdate(unitId, { status: UNIT_STATUS.AVAILABLE }, { new: true });
    }
}

module.exports = new UnitService();
