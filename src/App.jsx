import React, { useState, useEffect } from "react";

export default function App() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState(localStorage.getItem("userId"));
  const [credits, setCredits] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!userId) return;
    fetch(`/api/user?id=${userId}`)
      .then(res => res.json())
      .then(data => setCredits(data.credits || 0))
      .catch(console.error);
  }, [userId]);

  const registerUser = async () => {
    if (!username) return setStatus("❌ Enter username");

    const res = await fetch("/api/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email }),
    });
    const data = await res.json();
    if (data.id) {
      localStorage.setItem("userId", data.id);
      setUserId(data.id);
      setCredits(data.credits || 0);
      setStatus(`✅ Registered! Credits: ${data.credits || 0}`);
    } else {
      setStatus("❌ Registration failed");
    }
  };

  const buyCredits = async () => {
    if (!userId) return setStatus("❌ Register first");
    const res = await fetch("/api/payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userId }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else setStatus("❌ Stripe request failed");
  };

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
          /><br />
          <input
            type="email"
            placeholder="Email (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-2 border rounded w-64 mb-2"
          /><br />
          <button
            onClick={registerUser}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Register
          </button>
        </>
      ) : (
        <>
          <p>Credits: {credits !== null ? credits : "..."}</p>
          <button
            onClick={buyCredits}
            className="bg-green-600 text-white px-4 py-2 rounded mt-2"
          >
            Buy €5 Credits
          </button>
        </>
      )}

      <p className="mt-3">{status}</p>
    </div>
  );
}
