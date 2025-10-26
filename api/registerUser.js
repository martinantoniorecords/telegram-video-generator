import { supabase } from "../lib/supabaseClient.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { username, email } = req.body;
  if (!username) return res.status(400).json({ error: "Username is required" });

  try {
    const { data, error } = await supabase
      .from("users") // ✅ your table
      .insert([{ username, email, credits: 0 }])
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      userId: data.id,
      credits: data.credits || 0,
    });
  } catch (err) {
    console.error("Supabase error:", err.message);
    res.status(500).json({ error: err.message });
  }
}
