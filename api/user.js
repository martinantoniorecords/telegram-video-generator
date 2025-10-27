import { supabase } from "/db";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { id } = req.query;
    if (!id) return res.status(400).json({ success: false, error: "Missing id" });

    const { data, error } = await supabase
      .from("users")
      .select("credits")
      .eq("id", id)
      .single();

    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.json({ success: true, credits: data.credits });
  }

  if (req.method === "POST") {
    const { username, email } = req.body;
    if (!username) return res.status(400).json({ success: false, error: "Username is required" });

    const { data, error } = await supabase
      .from("users")
      .insert({ username, email, credits: 0 })
      .select()
      .single();

    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.json({ success: true, id: data.id, credits: data.credits });
  }

  res.status(405).json({ success: false, error: "Method not allowed" });
}
