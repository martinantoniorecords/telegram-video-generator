import React, { useState, useEffect } from "react";

export default function App() {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("Waiting for user messages...");
  const [videoUrl, setVideoUrl] = useState(null);
  const [lastTelegramMessage, setLastTelegramMessage] = useState(null);

  // Function to send message from website to Telegram bot
  const sendMessage = async () => {
    if (!message.trim()) return;
    setStatus("Sending...");
    try {
      const res = await fetch("/api/sendToTelegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("✅ Sent to bot. Waiting for video...");
        setMessage("");
      } else {
        setStatus("❌ Error sending message");
      }
    } catch (err) {
      console.error(err);
      setStatus("❌ Error sending message");
    }
  };

  // Poll for Telegram messages and video updates
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        // Latest Telegram message
        const msgRes = await fetch("/api/latestMessage");
        const msgData = await msgRes.json();
        if (msgData.message && msgData.message !== lastTelegramMessage) {
          setLastTelegramMessage(msgData.message);
          setStatus(`📩 New message from Telegram user: ${msgData.message}`);
        }

        // Video ready status
        const videoRes = await fetch("/api/videoReady");
        const videoData = await videoRes.json();
        if (videoData.videoUrl && videoData.videoUrl !== videoUrl) {
          setVideoUrl(videoData.videoUrl);
          setStatus("🎥 Your video is ready!");
        }
      } catch (err) {
        console.error("Polling error:", err);
        setStatus("❌ Error fetching updates");
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [lastTelegramMessage, videoUrl]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-700 to-black text-white p-6">
      <h1 className="text-3xl font-bold mb-6">🎬 Telegram Video Generator</h1>

      <p className="mb-4 text-gray-300">{status}</p>

      {/* Input to send message from website */}
      <div className="flex mb-6">
        <input
          className="p-3 rounded-l text-black w-80"
          placeholder="Describe your video..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          onClick={sendMessage}
          className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-r-xl font-semibold shadow-lg"
        >
          Send 🚀
        </button>
      </div>

      {/* Show last Telegram message */}
      {lastTelegramMessage && (
        <div className="mb-6 p-4 bg-gray-800 rounded-lg shadow-md w-80">
          <strong>Telegram user message:</strong>
          <p>{lastTelegramMessage}</p>
        </div>
      )}

      {/* Video display */}
      {videoUrl && (
        <div className="mt-4">
          <h2 className="text-xl mb-3">🎥 Your video is ready!</h2>
          <video src={videoUrl} controls className="w-80 rounded-lg shadow-xl" />
        </div>
      )}

      {!lastTelegramMessage && !videoUrl && (
        <p className="text-gray-400">Waiting for a user to send a message on Telegram or via website...</p>
      )}
    </div>
  );
}
