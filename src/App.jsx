const handleBuyCredits = async () => {
  if (!userId) return setStatus("❌ Please register first");

  try {
    const res = await fetch("/api/payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else setStatus("❌ Failed to create checkout session");
  } catch (err) {
    console.error(err);
    setStatus("❌ Stripe request failed");
  }
};
