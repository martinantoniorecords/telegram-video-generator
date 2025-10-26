import { supabase } from "../lib/supabaseClient.js";

export default async function handler(req, res) {
  const { method } = req;

  try {
    if (method === "POST") {
      // Register user
      const { username, email } = req.body;
      if (!username) return res.status(400).json({ error: "Username is required" });

      const { data, error } = await supabase
        .from("users")
        .insert([{ username, email, credits: 0 }])
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json({ success: true, userId: data.id, credits: data.credits });
    }

    if (method === "GET") {
      // Get user credits
      const { userId } = req.query;
      if (!userId) return res.status(400).json({ error: "Missing userId" });

      const { data, error } = await supabase
        .from("users")
        .select("credits")
        .eq("id", userId)
        .single();

      if (error) throw error;
      return res.status(200).json({ success: true, credits: data.credits });
    }

    if (method === "PUT") {
      // Add credits manually
      const { userId, amount } = req.body;
      if (!userId || !amount) return res.status(400).json({ error: "Missing parameters" });

      const { data, error } = await supabase
        .from("users")
        .select("credits")
        .eq("id", userId)
        .single();

      if (error) throw error;

      const newCredits = data.credits + amount;
      const { error: updateError } = await supabase
        .from("users")
        .update({ credits: newCredits })
        .eq("id", userId);

      if (updateError) throw updateError;
      return res.status(200).json({ success: true, credits: newCredits });
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
