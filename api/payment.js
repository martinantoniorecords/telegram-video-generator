// /api/payment.js
import Stripe from "stripe";
import { supabase } from "./db.js";

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

    // Optional: fetch user info from Supabase for metadata
    const { data: user, error } = await supabase
      .from("users")
      .select("username, email")
      .eq("id", userId)
      .single();

    if (error || !user) {
      console.error("Supabase error:", error);
      return res.status(400).json({ error: "User not found" });
    }

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Credit Pack (5€)",
              description: "Purchase credits for generating AI images",
            },
            unit_amount: 500, // €5 = 500 cents
          },
          quantity: 1,
        },
      ],
      success_url: "https://martitony.com/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://martitony.com/cancel",
      metadata: {
        user_id: userId,
        username: user.username,
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    return res
      .status(500)
      .json({ error: "Stripe connection failed: " + err.message });
  }
}
