import React, { useState, useEffect } from "react";

export default function RegisterForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [user, setUser] = useState(null); // store user object including id and credits

  // Fetch user if already registered
  useEffect(() => {
    const storedId = localStorage.getItem("userId");
    if (!storedId) return;

    async function fetchUser() {
      try {
        const res = await fetch(`/api/user?id=${storedId}`);
        const data = await res.json();
        if (data.success) setUser(data.user);
      } catch (err) {
        console.error(err);
      }
    }

    fetchUser();
  }, []);

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
        localStorage.setItem("userId", data.user.id);
        setUser(data.user);
        setStatus(`✅ Registered! Credits: ${data.user.credits}`);
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
    if (!user) {
      setStatus("❌ Please register first");
      return;
    }

    setStatus("Redirecting to Stripe Checkout...");

    try {
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // redirect to Stripe Checkout
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

      {!user && (
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

      {user && (
        <>
          <p className="mb-2">Credits: {user.credits}</p>
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
