import React, { useState, useEffect } from "react";

export default function App() {
  const [userId, setUserId] = useState(null); // will hold numeric ID
  const [username, setUsername] = useState("");
  const [credits, setCredits] = useState(null);
  const [status, setStatus] = useState("");
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState(null);
  const [buyAmount, setBuyAmount] = useState("");
  const [showRegister, setShowRegister] = useState(false);

  // Check if user exists in localStorage
  useEffect(() => {
    const savedId = localStorage.getItem("userId");
    if (savedId) {
      setUserId(Number(savedId));
      fetchCredits(Number(savedId));
    } else {
      setShowRegister(true);
    }
  }, []);

  const fetchCredits = async (id) => {
    try {
      const res = await fetch(`/api/getUserCredits?userId=${id}`);
      const data = await res.json();
      if (data.success) setCredits(data.credits);
    } catch (err) {
      console.error(err);
      setStatus("❌ Failed to fetch credits");
    }
  };

  // Register new user
  const registerUser = async () => {
    if (!username) return setStatus("❌ Enter a username");

    try {
      const res = await fetch("/api/registerUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (data.success) {
        setUserId(data.userId);
        localStorage.setItem("userId", data.userId);
        setCredits(data.credits);
        setShowRegister(false);
        setStatus("✅ Registered successfully!");
      } else {
        setStatus("❌ " + data.error);
      }
    } catch (err) {
      console.error(err);
      setStatus("❌ Registration failed");
    }
  };

  // Buy credits (same as before)
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
        setBuyAmount("");
      } else {
        setStatus("❌ " + (data.error || "Failed to purchase credits"));
      }
    } catch (err) {
      console.error(err);
      setStatus("❌ Request failed");
    }
  };

  // Generate image (same as before)
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">🎨 Stable Diffusion Generator</h1>

      {showRegister && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-6 rounded shadow-lg">
            <h2 className="text-xl mb-4">Register</h2>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="p-2 mb-4 rounded w-64 text-black"
            />
            <button
              onClick={registerUser}
              className="px-4 py-2 bg-green-500 rounded hover:bg-green-600"
            >
              Register
            </button>
            <p className="mt-2 text-sm">{status}</p>
          </div>
        </div>
      )}

      {!showRegister && (
        <>
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
        </>
      )}
    </div>
  );
}
