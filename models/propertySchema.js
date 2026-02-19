const mongoose = require('mongoose');
const propertySchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    description: { type: String }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for Units
propertySchema.virtual('units', {
    ref: 'Unit',
    localField: '_id',
    foreignField: 'propertyId'
});

module.exports = mongoose.model('Property', propertySchema);
