import React, { useState } from "react";

export default function RegisterForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

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
        localStorage.setItem("userId", data.userId); // store UUID locally
        setStatus(`✅ Registered! Credits: ${data.credits}`);
      } else {
        setStatus("❌ " + (data.error || "Registration failed"));
      }
    } catch (err) {
      console.error(err);
      setStatus("❌ Network error");
    }
  };

  return (
    <div className="p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">Register</h1>
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
      <p className="mt-3 text-gray-700">{status}</p>
    </div>
  );
}
