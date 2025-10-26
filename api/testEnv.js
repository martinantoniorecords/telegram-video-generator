export default function handler(req, res) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
  
    res.status(200).json({
      telegramToken: token ? "Loaded ✅" : "Not loaded ❌",
      telegramChatId: chatId ? "Loaded ✅" : "Not loaded ❌",
    });
  }
  