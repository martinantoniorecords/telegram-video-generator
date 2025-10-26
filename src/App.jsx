import React, { useState } from "react";

export default function RegisterForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [userId, setUserId] = useState(null);

  // Register user
  const handleRegister = async () => {
    if (!username) {
      setStatus("❌ Please enter a username");
      return;
    }

    setStatus("Registering...");

    try {
      const res = await fetch("/api/registerUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email }),
      });

      const data = await res.json();
      if (data.success) {
        localStorage.setItem("userId", data.userId);
        setUserId(data.userId);
        setStatus(`✅ Registered! Credits: ${data.credits}`);
      } else {
        setStatus("❌ " + (data.error || "Registration failed"));
      }
    } catch (err) {
      console.error(err);
      setStatus("❌ Network error");
    }
  };

  // Buy €5 credits via Stripe
  const handleBuyCredits = async () => {
    if (!userId) {
      setStatus("❌ Please register first");
      return;
    }

    try {
      const res = await fetch("/api/createCheckoutSession", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();
      if (data.url) {
        // Redirect user to Stripe Checkout
        window.location.href = data.url;
      } else {
        setStatus("❌ Failed to create checkout session");
      }
    } catch (err) {
      console.error(err);
      setStatus("❌ Stripe request failed");
    }
  };

  return (
    <div className="p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">Register & Buy Credits</h1>

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

      {!userId && (
        <button
          onClick={handleRegister}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Register
        </button>
      )}

      {userId && (
        <button
          onClick={handleBuyCredits}
          className="bg-green-600 text-white px-4 py-2 rounded mt-2"
        >
          Buy €5 Credits
        </button>
      )}

      <p className="mt-3 text-gray-700">{status}</p>
    </div>
  );
}
