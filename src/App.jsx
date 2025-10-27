import React, { useState, useEffect } from "react";

export default function RegisterForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [userId, setUserId] = useState(localStorage.getItem("userId"));
  const [credits, setCredits] = useState(null);

  // Fetch user credits
  useEffect(() => {
    if (!userId) return;
    fetch(`/api/user?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setCredits(data.credits);
      });
  }, [userId]);

  // Register user
  const handleRegister = async () => {
    if (!username) return setStatus("❌ Enter username");

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
    } catch {
      setStatus("❌ Network error");
    }
  };

  // Start Stripe checkout
  const handleBuyCredits = async () => {
    if (!userId) return setStatus("❌ Register first");

    try {
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setStatus("❌ Failed to create checkout session");
    } catch {
      setStatus("❌ Stripe request failed");
    }
  };

  return (
    <div className="p-6 text-center">
      {!userId && (
        <>
          <input
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <input
            placeholder="Email (optional)"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <button onClick={handleRegister}>Register</button>
        </>
      )}

      {userId && (
        <>
          <p>Credits: {credits !== null ? credits : "..."}</p>
          <button onClick={handleBuyCredits}>Buy €5 Credits</button>
        </>
      )}

      <p>{status}</p>
    </div>
  );
}
