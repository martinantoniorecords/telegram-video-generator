import { supabase } from "../lib/supabaseClient.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { userId, amount } = req.body;
  if (!userId || !amount) return res.status(400).json({ error: "Missing parameters" });

  try {
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("credits")
      .eq("id", userId)
      .single();

    if (userError) throw userError;

    const newCredits = user.credits + amount;
    const { error: updateError } = await supabase
      .from("users")
      .update({ credits: newCredits })
      .eq("id", userId);

    if (updateError) throw updateError;

    res.status(200).json({ success: true, credits: newCredits });
  } catch (err) {
    console.error("Supabase error:", err.message);
    res.status(500).json({ error: err.message });
  }
}
