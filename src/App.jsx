import React from "react";

export default function App() {
  const handleCheckout = async () => {
    try {
      const res = await fetch("/api/payment", { method: "POST" });
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe checkout
      } else {
        alert("❌ Stripe checkout failed");
        console.error("Stripe error:", data);
      }
    } catch (err) {
      alert("❌ Stripe request failed");
      console.error(err);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>💳 Stripe Checkout Test</h1>
      <p>Click the button to test a €5 payment.</p>
      <button
        onClick={handleCheckout}
        style={{
          backgroundColor: "#635BFF",
          color: "white",
          padding: "12px 24px",
          fontSize: "18px",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Pay €5 Test
      </button>
    </div>
  );
}
