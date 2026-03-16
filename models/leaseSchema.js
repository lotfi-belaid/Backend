const mongoose = require('mongoose');

const leaseSchema = new mongoose.Schema({
  unitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  rentAmount: { type: Number, required: true },
  depositAmount: Number,
  status: { type: String, enum: ['ACTIVE', 'TERMINATED'], default: 'ACTIVE' },
  createdAt: { type: Date, default: Date.now },
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
  signedContractUrl: { type: String },
  isArchived: { type: Boolean, default: false },
  previousVersionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lease' }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for Invoices 
leaseSchema.virtual('invoices', {
  ref: 'Invoice',//look to the INvoice model
  localField: '_id',//use this lease Id
  foreignField: 'leaseId'//and find all invoices where leaseId(localField) match that id)
});


module.exports = mongoose.model('Lease', leaseSchema);
