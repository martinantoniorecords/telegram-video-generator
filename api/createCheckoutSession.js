import Stripe from "stripe";
import { supabase } from "./db.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "eur",
          product_data: { name: "50 Credits" },
          unit_amount: 500, // €5 in cents
        },
        quantity: 1,
      }],
      mode: "payment",
      success_url: `${req.headers.origin}/payment-success?userId=${userId}`,
      cancel_url: `${req.headers.origin}/payment-cancelled`,
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: err.message });
  }
}
