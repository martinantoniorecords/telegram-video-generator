import Stripe from "stripe";
import { supabase } from "../lib/supabaseClient.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET; // set this in Vercel

export const config = {
  api: {
    bodyParser: false, // Stripe requires raw body
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const buf = await new Promise((resolve) => {
    let data = [];
    req.on("data", (chunk) => data.push(chunk));
    req.on("end", () => resolve(Buffer.concat(data)));
  });

  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, endpointSecret);
  } catch (err) {
    console.log("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle successful checkout
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.client_reference_id;

    try {
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("credits")
        .eq("id", userId)
        .single();

      if (userError) throw userError;

      const newCredits = user.credits + 50; // add 50 credits
      const { error: updateError } = await supabase
        .from("users")
        .update({ credits: newCredits })
        .eq("id", userId);

      if (updateError) throw updateError;

      console.log(`✅ Added 50 credits to user ${userId}`);
    } catch (err) {
      console.error("Supabase update error:", err.message);
    }
  }

  res.json({ received: true });
}
