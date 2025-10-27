import Stripe from "stripe";
import { supabase } from "./db"; // your existing supabase client

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { id } = req.body; // user id from Supabase

  if (!id) return res.status(400).json({ error: "User id missing" });

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "5 Credits" },
            unit_amount: 500, // $5
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_URL}/?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/?canceled=true`,
      metadata: { userId: id },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Stripe session creation failed" });
  }
}
