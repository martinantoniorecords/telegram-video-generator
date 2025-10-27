import Stripe from "stripe";
import { supabase } from "./db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  const sig = req.headers["stripe-signature"];
  const body = await buffer(req); // raw body for signature verification
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.log("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata.userId;

    // Add 5 credits in Supabase
    const { data, error } = await supabase
      .from("users")
      .update({ credits: supabase.raw("credits + 5") })
      .eq("id", userId);

    if (error) console.error("Supabase update error:", error);
    else console.log("Credits updated for user:", userId);
  }

  res.status(200).json({ received: true });
}

// Helper: convert request to buffer
async function buffer(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}
