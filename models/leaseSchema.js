const mongoose = require('mongoose');

const leaseSchema = new mongoose.Schema({
    unitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    rentAmount: { type: Number, required: true },
    depositAmount: Number,
    status: { type: String, enum: ['ACTIVE', 'TERMINATED'], default: 'ACTIVE' },
    createdAt: { type: Date, default: Date.now } ,
    termination: {
    status: {
      type: String,
      enum: ['NONE', 'REQUESTED', 'APPROVED', 'REJECTED'],
      default: 'NONE'
    },
    reason: { type: String, trim: true },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    requestedAt: Date,
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date
  },
    
});

module.exports = mongoose.model('Lease', leaseSchema);
