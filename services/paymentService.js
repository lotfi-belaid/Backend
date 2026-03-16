const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const Invoice = require("../models/invoiceSchema");
const Lease = require("../models/leaseSchema");
const User = require("../models/userSchema");
const notificationService = require("./notificationService");

async function createPaymentIntent(userId, invoiceId) {
  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) {
    const error = new Error("Invoice not found");
    error.status = 404;
    throw error;
  }
  const lease = await Lease.findById(invoice.leaseId).select("tenantId");
  if (!lease) {
    const error = new Error("Lease not found for this invoice");
    error.status = 404;
    throw error;
  }
  if (String(lease.tenantId) !== String(userId)) {
    const error = new Error("You can only pay your own invoices");
    error.status = 403;
    throw error;
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: invoice.amount * 100, // Convert to cents
    currency: "eur",
    automatic_payment_methods: {
      enabled: true,
    },
    metadata: {
      invoiceId: invoice._id.toString(),
      userId: userId,
    },
  });

  return paymentIntent.client_secret;
}

async function handleStripeWebhook(rawBody, signature) {
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    const error = new Error(`Webhook Error: ${err.message}`);
    error.status = 400;
    throw error;
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const invoiceId = paymentIntent.metadata.invoiceId;

    console.log(`💰 Payment Success for Invoice: ${invoiceId}`);

    const invoice = await Invoice.findByIdAndUpdate(invoiceId, {
      status: "PAID",
      paidAt: new Date(),
      paymentMethod: "STRIPE",
    }, { new: true }); // Return the updated document

    if (!invoice) {
      console.error(`Invoice ${invoiceId} not found during webhook update`);
    } else {
      const lease = await Lease.findById(invoice.leaseId);
      if (lease) {
        await notificationService.sendNotification(
          lease.ownerId,
          "Invoice Paid (Stripe)",
          `Tenant has paid the invoice for unit ${lease.unitId} via Stripe.`,
          "PAYMENT"
        );
      } else {
        console.error(`Lease ${invoice.leaseId} not found for invoice ${invoiceId} during webhook notification.`);
      }
    }
  }

  return { received: true };
}

async function getOwnerPayments(ownerId) {
  const ownerLeases = await Lease.find({ ownerId }).select("_id");
  const leaseIds = ownerLeases.map((leaseDoc) => leaseDoc._id);
  
  const invoices = await Invoice.find({ leaseId: { $in: leaseIds } })
    .populate({
      path: "leaseId",
      select: "tenantId",
      populate: { path: "tenantId", select: "name email" },
    })
    .sort({ dueDate: -1 });

  if (invoices.length === 0) {
    const error = new Error("No payments found.");
    error.status = 404;
    throw error;
  }

  return invoices.map((inv) => ({
    id: inv._id,
    tenant: inv.leaseId?.tenantId ? inv.leaseId.tenantId.name : "Unknown Tenant",
    email: inv.leaseId?.tenantId ? inv.leaseId.tenantId.email : "No email",
    amount: inv.amount,
    status: inv.status,
    dueDate: inv.dueDate,
    paidDate: inv.paidDate || null,
  }));
}

async function payInvoiceManually(tenantId, invoiceId) {
  const tenant = await User.findById(tenantId);
  const invoice = await Invoice.findById(invoiceId);

  if (!tenant || tenant.role !== "TENANT") {
    const error = new Error("Only tenants can pay invoices");
    error.status = 403;
    throw error;
  }
  if (tenant.isBanned) {
    const error = new Error("Your account is banned");
    error.status = 403;
    throw error;
  }
  if (!tenant.isApproved) {
    const error = new Error("Your account is not approved yet");
    error.status = 403;
    throw error;
  }
  if (!invoice) {
    const error = new Error("Invoice not found");
    error.status = 404;
    throw error;
  }

  invoice.status = "PAID";
  invoice.paidAt = new Date();
  await invoice.save();

  const lease = await Lease.findById(invoice.leaseId);
  if (lease) {
    await notificationService.sendNotification(
      lease.ownerId,
      "Invoice Paid",
      `Tenant has paid the invoice for unit ${lease.unitId}.`,
      "PAYMENT"
    );
  } else {
    console.error(`Lease ${invoice.leaseId} not found for invoice ${invoiceId} during manual payment notification.`);
  }

  return { tenantName: tenant.name, invoice };
}

async function getTenantInvoices(tenantId) {
  const tenantLeases = await Lease.find({ tenantId }).select("_id");
  const leaseIds = tenantLeases.map((l) => l._id);
  return await Invoice.find({ leaseId: { $in: leaseIds } }).sort({ dueDate: -1 });
}

module.exports = {
  createPaymentIntent,
  handleStripeWebhook,
  getOwnerPayments,
  payInvoiceManually,
  getTenantInvoices,
};
