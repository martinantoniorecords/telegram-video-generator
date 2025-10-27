// /api/payment.js
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: "Credits Package (€5)" },
            unit_amount: 500, // 5 EUR in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "https://martitony.com/success",
      cancel_url: "https://martitony.com/cancel",
      metadata: { userId },
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("🔥 Stripe Error:", error);
    res.status(500).json({ error: error.message });
  }
}
