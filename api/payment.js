import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const { id } = req.body; // user.id from Supabase

  if (!id) return res.status(400).json({ error: "Missing user id" });

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: "5€ Credits" },
            unit_amount: 500, // €5
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: { user_id: id }, // store user id like PHP
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?id=${id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/canceled`,
    });

    // Just redirect like your PHP script
    res.redirect(303, session.url);
  } catch (err) {
    console.error(err);
    res.status(500).send("Stripe server error");
  }
}
