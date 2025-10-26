import Stripe from "stripe";
import { supabase } from "../lib/supabaseClient.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  try {
    if (req.method === "POST") {
      // Create Checkout Session
      const { userId } = JSON.parse(req.body);
      if (!userId) return res.status(400).json({ error: "Missing userId" });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{
          price_data: {
            currency: "eur",
            product_data: { name: "50 Credits" },
            unit_amount: 500,
          },
          quantity: 1,
        }],
        mode: "payment",
        client_reference_id: userId,
        success_url: `${req.headers.origin}/payment-success?userId=${userId}`,
        cancel_url: `${req.headers.origin}/payment-cancelled`,
      });

      return res.status(200).json({ url: session.url });
    }

    if (req.method === "POST" && req.headers["stripe-signature"]) {
      // Webhook
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
        console.error("Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const userId = session.client_reference_id;

        const { data: user, error: userError } = await supabase
          .from("users")
          .select("credits")
          .eq("id", userId)
          .single();

        if (userError) throw userError;

        const newCredits = user.credits + 50;
        const { error: updateError } = await supabase
          .from("users")
          .update({ credits: newCredits })
          .eq("id", userId);

        if (updateError) throw updateError;

        console.log(`✅ Added 50 credits to user ${userId}`);
      }

      return res.json({ received: true });
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
