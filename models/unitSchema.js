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
});

module.exports = mongoose.model('Unit', unitSchema);
