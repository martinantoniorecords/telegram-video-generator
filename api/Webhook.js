import Stripe from "stripe";
import { supabase } from "./db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const config = {
  api: { bodyParser: false }, // Stripe requires raw body
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  let event;
  const buf = await new Promise((resolve) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
  });

  const sig = req.headers["stripe-signature"];
  try {
    event = stripe.webhooks.constructEvent(buf, sig, endpointSecret);
  } catch (err) {
    console.log("Webhook signature failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle checkout session completed
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata.userId;

    // Update user credits in Supabase
    const { data, error } = await supabase
      .from("users")
      .select("credits")
      .eq("id", userId)
      .single();

    if (!error && data) {
      const newCredits = (data.credits || 0) + 5; // add €5 credits
      await supabase.from("users").update({ credits: newCredits }).eq("id", userId);
      console.log(`Credits updated for user ${userId}: ${newCredits}`);
    }
  }

  res.json({ received: true });
}
