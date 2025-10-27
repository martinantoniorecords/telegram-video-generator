import React, { useState, useEffect } from "react";

export default function RegisterForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [userId, setUserId] = useState(localStorage.getItem("userId"));
  const [credits, setCredits] = useState(null);

  // Fetch credits if user already registered or returning from Stripe
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const successCredits = urlParams.get("credits");
    if (successCredits) {
      setCredits(Number(successCredits));
      setStatus("✅ Purchase successful!");
      // Remove credits param from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (!userId) return;

    async function fetchCredits() {
      try {
        const res = await fetch(`/api/user?id=${userId}`);
        const data = await res.json();
        if (data.success) setCredits(data.credits);
      } catch (err) {
        console.error(err);
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
        localStorage.setItem("userId", data.id);
        setUserId(data.id);
        setCredits(data.credits);
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
      // This triggers redirect to Stripe Checkout
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId }),
      });

      if (res.redirected) {
        window.location.href = res.url; // redirect to Stripe
      } else {
        const data = await res.json();
        setStatus("❌ " + (data.error || "Stripe checkout failed"));
      }
    } catch (err) {
      console.error(err);
      setStatus("❌ Stripe request failed");
    }
  };

  return (
    <div className="p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">Register & Buy Credits</h1>

      {!userId && (
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
      )}

      {userId && (
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
