const mongoose = require('mongoose');

const leaseSchema = new mongoose.Schema({
    unitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    rentAmount: { type: Number, required: true },
    depositAmount: Number,
    status: { type: String, enum: ['ACTIVE', 'TERMINATED'], default: 'ACTIVE' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Lease', leaseSchema);
