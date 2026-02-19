const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema({
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    unitNumber: { type: String, required: true },
    bedrooms: Number,
    bathrooms: Number,
    areaM2: Number,
    rentAmount: { type: Number, required: true },
    depositAmount: { type: Number },
    status: { type: String, enum: ['AVAILABLE', 'OCCUPIED'], default: 'AVAILABLE' },
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for All Leases (History)
unitSchema.virtual('leases', {
    ref: 'Lease',
    localField: '_id',
    foreignField: 'unitId'
});

// Virtual for Active Lease (1:1 Concept)
unitSchema.virtual('activeLease', {
    ref: 'Lease',
    localField: '_id',
    foreignField: 'unitId',
    justOne: true,
    options: { match: { status: 'ACTIVE' } }
});

// Virtual for Maintenance Requests
unitSchema.virtual('maintenanceRequests', {
    ref: 'Maintenance',
    localField: '_id',
    foreignField: 'unitId'
});


module.exports = mongoose.model('Unit', unitSchema);
