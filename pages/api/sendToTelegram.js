export default async function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }
  
    const { message } = req.body;
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
  
    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is empty" });
    }
  
    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: `🎬 New video request:\n${message}` }),
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(JSON.stringify(data));
  
      res.status(200).json({ success: true, data });
    } catch (err) {
      console.error("Telegram API error:", err);
      res.status(500).json({ error: err.message });
    }
  }
  