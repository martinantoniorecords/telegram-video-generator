import React, { useState, useEffect } from "react";

// Use numeric user ID that exists in Supabase
const userId = 1; // replace with your actual user ID in Supabase

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState("");
  const [image, setImage] = useState(null);
  const [credits, setCredits] = useState(null);
  const [buyAmount, setBuyAmount] = useState(""); // input for buying credits

  // Fetch initial credits on page load
  useEffect(() => {
    async function fetchCredits() {
      try {
        const res = await fetch(`/api/getUserCredits?userId=${userId}`);
        const data = await res.json();
        if (data.success) {
          setCredits(data.credits);
        } else {
          setStatus("❌ " + (data.error || "Failed to fetch credits"));
        }
      } catch (err) {
        console.error(err);
        setStatus("❌ Error fetching credits");
      }
    }
    fetchCredits();
  }, []);

  // Generate image
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

  // Buy credits
  const purchaseCredits = async () => {
    const amount = parseInt(buyAmount, 10);
    if (!amount || amount <= 0) {
      setStatus("❌ Enter a valid number of credits");
      return;
    }

    try {
      const res = await fetch("/api/purchaseCredits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, amount }),
      });
      const data = await res.json();

      if (data.success) {
        setCredits(data.credits);
        setStatus(data.message);
        setBuyAmount(""); // clear input
      } else {
        setStatus("❌ " + (data.error || "Failed to purchase credits"));
      }
    } catch (err) {
      console.error(err);
      setStatus("❌ Request failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">🎨 Stable Diffusion Generator</h1>

      <p className="mb-4">Credits left: {credits !== null ? credits : "..."}</p>

      <input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your prompt..."
        className="p-3 mb-4 border rounded w-80 text-black"
      />

      <div className="flex gap-4 mb-4">
        <button
          onClick={generateImage}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded"
        >
          Generate Image
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="number"
          min="1"
          placeholder="Credits to buy"
          value={buyAmount}
          onChange={(e) => setBuyAmount(e.target.value)}
          className="p-2 rounded w-32 text-black"
        />
        <button
          onClick={purchaseCredits}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded"
        >
          Buy Credits
        </button>
      </div>

      <p className="mb-4">{status}</p>

      {image && (
        <div className="mt-6">
          <img src={image} alt="Generated" className="rounded shadow-lg max-w-xs" />
        </div>
      )}
    </div>
  );
}
