import fetch from "node-fetch";
import { getUser, deductCredit } from "./db";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { userId, prompt } = req.body;
  if (!userId || !prompt) return res.status(400).json({ error: "Missing userId or prompt" });

  const user = await getUser(userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  if (user.credits <= 0) return res.status(403).json({ error: "No credits left" });

  try {
    const response = await fetch(process.env.SD_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, steps: 20, width: 512, height: 512 }),
    });
    const data = await response.json();
    const imageBase64 = data.images[0];

    const updatedUser = await deductCredit(userId, 1);

    res.status(200).json({ success: true, image: `data:image/png;base64,${imageBase64}`, creditsLeft: updatedUser.credits });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate image" });
  }
}
