const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
    unitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['OPEN', 'IN_PROGRESS', 'DONE'], default: 'OPEN' },
    createdAt: { type: Date, default: Date.now },
    report: {
        description: { type: String },
        cost: { type: Number },
        submittedAt: { type: Date }
    }
});

module.exports = mongoose.model('Maintenance', maintenanceSchema);
