import { createUser } from "./db";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { username } = req.body;
  if (!username) return res.status(400).json({ error: "Missing username" });

  try {
    const user = await createUser(username);
    res.status(200).json({
      success: true,
      userId: user.id, // UUID
      credits: user.credits,
    });
  } catch (err) {
    console.error("registerUser error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
