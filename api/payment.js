// /api/payment.js
import Stripe from "stripe";

export default async function handler(req, res) {
  console.log("👉 Incoming request to /api/payment");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Check if key exists
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("❌ STRIPE_SECRET_KEY missing in environment");
    return res.status(500).json({ error: "Missing Stripe secret key" });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    console.log("✅ Creating Stripe session...");
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: "€5 Test Credits" },
            unit_amount: 500, // €5.00
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "https://martitony.com/success",
      cancel_url: "https://martitony.com/cancel",
    });

    console.log("✅ Session created:", session.id);
    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("❌ Stripe error:", error);
    res.status(500).json({ error: error.message });
  }
}
