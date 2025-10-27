import React, { useState, useEffect } from "react";

export default function RegisterForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [userId, setUserId] = useState(localStorage.getItem("userId"));
  const [credits, setCredits] = useState(null);

  // Fetch user credits if already registered
  useEffect(() => {
    if (!userId) return;

    async function fetchCredits() {
      try {
        const res = await fetch(`/api/user?userId=${userId}`);
        const data = await res.json();
        if (data.success) {
          setCredits(data.credits);
        } else {
          console.error("❌ Failed to fetch credits:", data.error);
        }
      } catch (err) {
        console.error("❌ Error fetching credits:", err);
      }
    }

    fetchCredits();
  }, [userId]);

  // Register user
  const handleRegister = async () => {
    if (!username) {
      setStatus("❌ Please enter a username");
      return;
    }

    setStatus("Registering...");

    try {
      const res = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email }),
      });

      const data = await res.json();
      if (data.success) {
        localStorage.setItem("userId", data.userId);
        setUserId(data.userId);
        setCredits(data.credits);
        setStatus(`✅ Registered! Credits: ${data.credits}`);
      } else {
        setStatus("❌ " + (data.error || "Registration failed"));
      }
    } catch (err) {
      console.error("Network error:", err);
      setStatus("❌ Network error");
    }
  };

  // Buy €5 credits via Stripe Checkout
  const handleBuyCredits = async () => {
    if (!userId) {
      setStatus("❌ Please register first");
      return;
    }

    setStatus("Connecting to Stripe...");

    try {
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      // Sometimes the backend returns plain text instead of JSON when error happens
      const text = await res.text();

      try {
        const data = JSON.parse(text);

        if (data.url) {
          window.location.href = data.url;
        } else {
          setStatus("❌ " + (data.error || "Failed to create checkout session"));
          console.error("Stripe error response:", data);
        }
      } catch {
        console.error("Raw Stripe response (not JSON):", text);
        setStatus("❌ Stripe server error");
      }
    } catch (err) {
      console.error("Stripe network error:", err);
      setStatus("❌ Stripe request failed");
    }
  };

  // UI
  return (
    <div className="p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">Register & Buy Credits</h1>

      {!userId ? (
        <>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="p-2 border rounded w-64 mb-2"
          />
          <br />
          <input
            type="email"
            placeholder="Email (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-2 border rounded w-64 mb-2"
          />
          <br />
          <button
            onClick={handleRegister}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Register
          </button>
        </>
      ) : (
        <>
          <p className="mb-2">Credits: {credits !== null ? credits : "..."}</p>
          <button
            onClick={handleBuyCredits}
            className="bg-green-600 text-white px-4 py-2 rounded mt-2"
          >
            Buy €5 Credits
          </button>
        </>
      )}

      <p className="mt-3 text-gray-700">{status}</p>
    </div>
  );
}
