const Property = require('../models/propertySchema');
const Unit = require('../models/unitSchema');
const User = require('../models/userSchema');
const AppError = require('../utils/AppError');

class PropertyService {
    async findById(id) {
        return Property.findById(id);
    }

    async findAll() {
        return Property.find();
    }

    async findByOwner(ownerId) {
        return Property.find({ ownerId });
    }

    async createProperty(ownerId, propertyData) {
        const property = new Property({ ...propertyData, ownerId });
        await property.save();

        // Increment owner's total properties count
        await User.findByIdAndUpdate(ownerId, {
            $inc: { ownerTotalProperties: 1 }
        });

        return property;
    }

    async updateProperty(propertyId, ownerId, updateData) {
        const property = await this.findById(propertyId);
        if (!property) {
            throw new AppError('Property not found', 404);
        }

        if (String(property.ownerId) !== String(ownerId)) {
            throw new AppError('You can only update your own properties', 403);
        }

        Object.keys(updateData).forEach(key => {
            if (updateData[key] !== undefined) {
                property[key] = updateData[key];
            }
        });

        await property.save();
        return property;
    }

    async deleteProperty(propertyId, ownerId) {
        const property = await this.findById(propertyId);
        if (!property) {
            throw new AppError('Property not found', 404);
        }

        if (String(property.ownerId) !== String(ownerId)) {
            throw new AppError('You can only delete your own properties', 403);
        }

        await property.deleteOne();

        // Decrement owner's total properties count
        await User.findByIdAndUpdate(ownerId, {
            $inc: { ownerTotalProperties: -1 }
        });

        return property;
    }

    async verifyOwnership(propertyId, ownerId) {
        const property = await this.findById(propertyId);
        if (!property) {
            throw new AppError('Property not found', 404);
        }
        if (String(property.ownerId) !== String(ownerId)) {
            throw new AppError('You do not own this property', 403);
        }
        return property;
    }
}

module.exports = new PropertyService();
