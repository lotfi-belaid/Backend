const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const Invoice = require("../models/invoiceSchema");
const Lease = require("../models/leaseSchema");

// Create the Payment Intent
module.exports.createPaymentIntent = async (req, res) => {
  try {
    const { invoiceId } = req.body;
    const userId = req.user?.id;

    // Validate Invoice
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    const lease = await Lease.findById(invoice.leaseId).select("tenantId");
    if (!lease) {
      return res
        .status(404)
        .json({ message: "Lease not found for this invoice" });
    }
    if (String(lease.tenantId) !== String(userId)) {
      return res
        .status(403)
        .json({ message: "You can only pay your own invoices" });
    }

    // Create the intent
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
    res.status(200).json({
      message: "Payment Intent created successfully",
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// The Webhook Listener
module.exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    // Verify signature
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error("Webhook Error:", err.message);
    return res.status(400).json({ message: `Webhook Error: ${err.message}` });
  }

  try {
    // Handle the event
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      const invoiceId = paymentIntent.metadata.invoiceId;

      console.log(`💰 Payment Success for Invoice: ${invoiceId}`);

      // Update database
      const invoice = await Invoice.findByIdAndUpdate(invoiceId, {
        status: "PAID",
        paidAt: new Date(),
        paymentMethod: "STRIPE",
      });

      if (!invoice) {
        console.error(`Invoice ${invoiceId} not found during webhook update`);
      }
    }

    // Return success to Stripe
    res.json({ received: true });
  } catch (error) {
    // Catch any database errors during the update
    console.error("Database Error in Webhook:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};
