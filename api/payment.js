// /api/payment.js
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "€5 Test Credits",
            },
            unit_amount: 500, // €5.00
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "https://martitony.com/success",
      cancel_url: "https://martitony.com/cancel",
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("❌ Stripe error:", error.message);
    res.status(500).json({ error: "Stripe server error" });
  }
}
