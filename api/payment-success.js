import Stripe from "stripe";
import { supabase } from "/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const { id, session_id } = req.query;
  if (!id || !session_id) return res.status(400).send("Missing parameters");

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status === "paid") {
      const { data, error } = await supabase
        .from("users")
        .update({ credits: 10 }) // e.g., give 10 credits per €5
        .eq("id", id);

      if (error) return res.status(500).send(error.message);
      return res.redirect("/?success=true");
    }
    res.redirect("/?success=false");
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
}
