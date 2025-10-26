import { getUser, addCredits } from "./db";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { userId, prompt } = req.body;

  if (!userId || !prompt) return res.status(400).json({ error: "Missing parameters" });

  try {
    const user = await getUser(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.credits <= 0) return res.status(403).json({ error: "No credits left" });

    // Call Stable Diffusion WebUI API
    const response = await fetch("http://localhost:7860/sdapi/v1/txt2img", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        steps: 20,
        width: 512,
        height: 512,
      }),
    });

    const data = await response.json();

    if (!data || !data.images || data.images.length === 0) {
      return res.status(500).json({ error: "Failed to generate image" });
    }

    // Deduct 1 credit
    const updatedUser = await addCredits(userId, -1);

    // data.images[0] is Base64 image
    res.status(200).json({
      success: true,
      image: `data:image/png;base64,${data.images[0]}`,
      creditsLeft: updatedUser.credits,
    });
  } catch (err) {
    console.error("generatePhoto error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
