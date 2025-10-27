import Stripe from "stripe";
import { supabase } from "../../lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const config = {
  api: { bodyParser: false }, // Required for raw body
};

const buffer = async (req) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  const buf = await buffer(req);
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Only handle successful payments
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata.userId;

    if (!userId || userId === "null") {
      console.error("Invalid userId in webhook");
      return res.status(400).send("Invalid userId");
    }

    try {
      // Add credits in Supabase (e.g., +5 credits)
      const { data, error } = await supabase
        .from("users")
        .update({ credits: supabase.raw("credits + 5") })
        .eq("id", userId)
        .select()
        .single();

      if (error) throw error;
      console.log(`Added 5 credits to user ${userId}, total now: ${data.credits}`);
    } catch (err) {
      console.error("Supabase update error:", err.message);
      return res.status(500).send("Supabase error");
    }
  }

  res.json({ received: true });
}
