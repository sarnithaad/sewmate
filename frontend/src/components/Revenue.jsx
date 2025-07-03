import React, { useEffect, useState } from "react";

export default function Revenue() {
  const [bills, setBills] = useState([]);
  const [error, setError] = useState("");

  // Get shopkeeper ID from localStorage
  const shopkeeper = JSON.parse(localStorage.getItem("shopkeeper") || "{}");
  const shopkeeperId = shopkeeper.id;

  useEffect(() => {
    if (!shopkeeperId) {
      setError("Shopkeeper not found.");
      return;
    }
    fetch(`${process.env.REACT_APP_API_URL}/api/bills/${shopkeeperId}`)
      .then(async res => {
        if (!res.ok) {
          let msg = "Failed to fetch bills";
          try { msg = (await res.json()).error || msg; } catch {}
          throw new Error(msg);
        }
        return res.json();
      })
      .then(setBills)
      .catch(err => setError(err.message || "Error loading revenue"));
  }, [shopkeeperId]);

  // Revenue calculations
  const dueRevenue = bills
    .filter(b => b.status !== "Delivered")
    .reduce((sum, b) => sum + parseFloat(b.total_value || 0), 0);

  const actualRevenue = bills
    .filter(b => b.status === "Delivered")
    .reduce((sum, b) => sum + parseFloat(b.total_value || 0), 0);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Revenue</h2>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <div className="mb-2">
        Expected Revenue: ₹{dueRevenue.toLocaleString("en-IN")}
      </div>
      <div className="mb-2">
        Actual Revenue: ₹{actualRevenue.toLocaleString("en-IN")}
      </div>
    </div>
  );
}
