const Stripe = require('stripe');
const Invoice = require('../models/invoiceSchema');
const config = require('../config');
const AppError = require('../utils/AppError');

class PaymentService {
    constructor() {
        this.stripe = config.stripe.secretKey ? Stripe(config.stripe.secretKey) : null;
    }

    async findInvoiceById(id) {
        return Invoice.findById(id);
    }

    async findAllInvoices() {
        return Invoice.find().populate('tenantId', 'name email').sort({ dueDate: -1 });
    }

    async createPaymentIntent(invoiceId, userId) {
        if (!this.stripe) {
            throw new AppError('Stripe is not configured', 500);
        }

        const invoice = await this.findInvoiceById(invoiceId);
        if (!invoice) {
            throw new AppError('Invoice not found', 404);
        }

        const paymentIntent = await this.stripe.paymentIntents.create({
            amount: invoice.amount * 100,
            currency: 'eur',
            automatic_payment_methods: { enabled: true },
            metadata: {
                invoiceId: invoice._id.toString(),
                userId: userId
            }
        });

        return paymentIntent;
    }

    async handleWebhook(rawBody, signature) {
        if (!this.stripe) {
            throw new AppError('Stripe is not configured', 500);
        }

        const event = this.stripe.webhooks.constructEvent(
            rawBody,
            signature,
            config.stripe.webhookSecret
        );

        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object;
            const invoiceId = paymentIntent.metadata.invoiceId;

            const invoice = await Invoice.findByIdAndUpdate(invoiceId, {
                status: 'PAID',
                paidAt: new Date(),
                paymentMethod: 'STRIPE'
            });

            if (!invoice) {
                console.error(`Invoice ${invoiceId} not found during webhook update`);
            }
        }

        return { received: true };
    }

    async markInvoiceAsPaid(invoiceId) {
        const invoice = await this.findInvoiceById(invoiceId);
        if (!invoice) {
            throw new AppError('Invoice not found', 404);
        }

        invoice.status = 'PAID';
        invoice.paidAt = new Date();
        await invoice.save();
        return invoice;
    }

    formatPayments(invoices) {
        return invoices.map(inv => ({
            id: inv._id,
            tenant: inv.tenantId ? inv.tenantId.name : 'Unknown Tenant',
            email: inv.tenantId ? inv.tenantId.email : 'No email',
            amount: inv.amount,
            status: inv.status,
            dueDate: inv.dueDate,
            paidDate: inv.paidDate || null
        }));
    }
}

module.exports = new PaymentService();
