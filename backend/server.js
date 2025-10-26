import express from "express";
import cors from "cors";
import fs from "fs";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

const USERS_FILE = "users.json";
let users = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));

// Helper to save users
function saveUsers() {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Generate image endpoint
app.post("/generatePhoto", async (req, res) => {
  const { userId, prompt } = req.body;
  if (!userId || !prompt) return res.status(400).json({ error: "Missing userId or prompt" });

  const user = users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  if (user.credits <= 0) {
    return res.status(403).json({ error: "No credits left. Please purchase more." });
  }

  try {
    // Call Stable Diffusion WebUI
    const response = await fetch("http://127.0.0.1:7860/sdapi/v1/txt2img", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        steps: 20,
        width: 512,
        height: 512
      }),
    });

    const data = await response.json();
    const imageBase64 = data.images[0];

    // Deduct credit
    user.credits -= 1;
    saveUsers();

    res.json({ success: true, image: `data:image/png;base64,${imageBase64}`, creditsLeft: user.credits });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate image" });
  }
});

// Purchase credits endpoint (placeholder for Stripe/PayPal)
app.post("/purchaseCredits", (req, res) => {
  const { userId, amount } = req.body;
  const user = users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  user.credits += amount;
  saveUsers();
  res.json({ success: true, credits: user.credits });
});

app.listen(5000, () => console.log("Backend running on http://localhost:5000"));
