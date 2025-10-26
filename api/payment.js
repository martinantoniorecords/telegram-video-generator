import Stripe from "stripe";
import { supabase } from "./db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method === "POST") {
    // Create Checkout Session
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "User ID is required" });

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: { name: "5€ Credits Pack" },
              unit_amount: 500, // €5 in cents
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/cancel`,
        metadata: { userId },
      });

      res.status(200).json({ url: session.url });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  } else if (req.method === "POST" && req.url.includes("/webhook")) {
    // Webhook handler
    const sig = req.headers["stripe-signature"];
    const rawBody = await buffer(req); // utility to read raw body

    let event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata.userId;

      // Add credits to the user
      await supabase
        .from("users")
        .update({ credits: supabase.raw("credits + 10") }) // add 10 credits
        .eq("id", userId);
    }

    res.json({ received: true });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

// Utility to read raw body for Stripe webhook
async function buffer(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}
