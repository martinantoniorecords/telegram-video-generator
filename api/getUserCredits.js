import { getUser } from "./db";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  const user = await getUser(userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  res.status(200).json({ success: true, credits: user.credits });
}
