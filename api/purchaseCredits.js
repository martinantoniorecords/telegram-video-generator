import { addCredits, getUser } from "./db";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { userId, amount } = req.body;
  if (!userId || !amount || amount <= 0) return res.status(400).json({ error: "Invalid parameters" });

  const user = await getUser(userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  await addCredits(userId, amount);
  const updatedUser = await getUser(userId);

  res.status(200).json({ success: true, credits: updatedUser.credits });
}
