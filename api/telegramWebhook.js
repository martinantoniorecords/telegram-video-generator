// /api/telegramWebhook.js
export default async function handler(req, res) {
    if (req.method === "POST") {
      const { message } = req.body; // Telegram sends updates here
      if (message && message.text) {
        console.log("Received from user:", message.text);
        
        // Save the message somewhere (DB, memory, etc.)
        // For demo, let's just save it in a simple object
        // In production, use DB
        global.lastUserMessage = message.text;
        
        // Optionally respond immediately
        const token = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = message.chat.id;
  
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: "✅ Got your message! Generating your video..."
          }),
        });
  
        return res.status(200).json({ ok: true });
      }
      return res.status(400).json({ ok: false, error: "No message" });
    } else {
      return res.status(405).json({ ok: false, error: "Method not allowed" });
    }
  }
  