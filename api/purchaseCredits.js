import { addCredits, getUser } from "./db";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId, amount } = req.body;

  if (!userId || !amount || typeof amount !== "number" || amount <= 0) {
    return res.status(400).json({ error: "Invalid parameters" });
  }

  try {
    const user = await getUser(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const updatedUser = await addCredits(userId, amount);
    if (!updatedUser) throw new Error("Failed to add credits");

    res.status(200).json({
      success: true,
      credits: updatedUser.credits,
      message: `✅ Added ${amount} credits to ${userId}`,
    });
  } catch (err) {
    console.error("purchaseCredits error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
