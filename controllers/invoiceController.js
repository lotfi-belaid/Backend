const paymentService = require("../services/paymentService");

// Create the Payment Intent
module.exports.createPaymentIntent = async (req, res) => {
  try {
    const { id: invoiceId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: no user in token" });
    }

    const clientSecret = await paymentService.createPaymentIntent(userId, invoiceId);
    res.status(200).json({
      message: "Payment Intent created successfully",
      clientSecret,
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Server Error", error });
  }
};

// The Webhook Listener
module.exports.handleStripeWebhook = async (req, res) => {
  try {
    const sig = req.headers["stripe-signature"];
    const result = await paymentService.handleStripeWebhook(req.rawBody, sig);
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Server Error", error });
  }
};

//view Payments
module.exports.viewPayments = async (req, res) => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      return res.status(401).json({ message: "Unauthorized: no user in token" });
    }

    const payments = await paymentService.getOwnerPayments(ownerId);
    res.status(200).json({
      message: "Payments fetched successfully.",
      payments,
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Server Error", error });
  }
};

//pay Invoice
module.exports.payInvoice = async (req, res) => {
  try {
    const tenantId = req.user?.id;
    if (!tenantId) {
      return res.status(401).json({ message: "Unauthorized: no user in token" });
    }
    const { id: invoiceId } = req.params;

    const { tenantName, invoice } = await paymentService.payInvoiceManually(tenantId, invoiceId);
    res.json({
      message: `Invoice #${invoiceId} paid successfully by ${tenantName}`,
      invoice,
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Server Error", error });
  }
};

// get Tenant Invoices
module.exports.getTenantInvoices = async (req, res) => {
  try {
    const invoices = await paymentService.getTenantInvoices(req.user.id);
    res.json({ data: invoices });
  } catch (error) {
    res.status(500).json({ message: "Error fetching invoices", error });
  }
};
