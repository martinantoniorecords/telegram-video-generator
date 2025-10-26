import React, { useState, useEffect } from "react";

const userId = "user1"; // demo user

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState("");
  const [image, setImage] = useState(null);
  const [credits, setCredits] = useState(null);

  useEffect(() => {
    async function fetchCredits() {
      const res = await fetch(`/api/getUserCredits?userId=${userId}`);
      const data = await res.json();
      if (data.success) setCredits(data.credits);
    }
    fetchCredits();
  }, []);

  const generateImage = async () => {
    if (credits <= 0) {
      setStatus("❌ No credits left");
      return;
    }

    setStatus("Generating...");
    setImage(null);

    try {
      const res = await fetch("/api/generatePhoto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, prompt }),
      });
      const data = await res.json();

      if (data.success) {
        setImage(data.image);
        setCredits(data.creditsLeft);
        setStatus("✅ Image generated!");
      } else {
        setStatus("❌ " + data.error);
      }
    } catch (err) {
      console.error(err);
      setStatus("❌ Backend request failed");
    }
  };

  const purchaseCredits = async () => {
    const amount = parseInt(prompt("Enter credits to purchase:"), 10);
    if (!amount || amount <= 0) return;

    const res = await fetch("/api/purchaseCredits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, amount }),
    });
    const data = await res.json();
    if (data.success) {
      setCredits(data.credits);
      setStatus(`✅ Purchased ${amount} credits`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-6">Stable Diffusion Generator (Credits)</h1>
      <p>Credits left: {credits !== null ? credits : "..."}</p>

      <input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your prompt..."
        className="p-3 mb-4 border rounded w-80"
      />

      <div className="flex gap-4">
        <button onClick={generateImage} className="px-6 py-3 bg-blue-500 text-white rounded">
          Generate Image
        </button>
        <button onClick={purchaseCredits} className="px-6 py-3 bg-green-500 text-white rounded">
          Buy Credits
        </button>
      </div>

      <p className="mt-4">{status}</p>

      {image && (
        <div className="mt-6">
          <img src={image} alt="Generated" className="rounded shadow-lg" />
        </div>
      )}
    </div>
  );
}
