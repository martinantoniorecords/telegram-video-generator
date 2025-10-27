// /api/user.js
import { supabase } from "./db";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { username, email } = req.body;
    if (!username) return res.status(400).json({ error: "Username is required" });

    try {
      const { data, error } = await supabase
        .from("users")
        .insert({ username, email })
        .select()
        .single();

      if (error) throw error;

      res.status(200).json({ success: true, id: data.id, credits: data.credits || 0 });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  } else if (req.method === "GET") {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "User ID is required" });

    try {
      const { data, error } = await supabase
        .from("users")
        .select("credits")
        .eq("id", id)
        .single();

      if (error) throw error;

      res.status(200).json({ success: true, credits: data.credits });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
