// /api/videoReady.js
let latestVideo = null; // Simple in-memory store (you can replace with Supabase later)

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { videoUrl } = req.body;
    latestVideo = videoUrl;
    return res.status(200).json({ success: true });
  }

  if (req.method === "GET") {
    return res.status(200).json({ videoUrl: latestVideo });
  }

  res.status(405).json({ error: "Method not allowed" });
}
