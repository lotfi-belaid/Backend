const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    leaseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lease', required: true },
    amount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ['UNPAID', 'PAID'], default: 'UNPAID' },
    createdAt: { type: Date, default: Date.now },
    paidAt: { type: Date },
});

module.exports = mongoose.model('Invoice', invoiceSchema);
