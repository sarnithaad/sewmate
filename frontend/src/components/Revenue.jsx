import React, { useEffect, useState } from "react";

export default function Revenue() {
  const [bills, setBills] = useState([]);
  useEffect(() => {
    // Replace 1 with actual shopkeeper_id
    fetch("/api/bills/1")
      .then(res => res.json())
      .then(setBills);
  }, []);
  // Revenue calculations
  const dueRevenue = bills.filter(b => b.status !== "Delivered").reduce((sum, b) => sum + parseFloat(b.total_value), 0);
  const actualRevenue = bills.filter(b => b.status === "Delivered").reduce((sum, b) => sum + parseFloat(b.total_value), 0);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Revenue</h2>
      <div className="mb-2">Expected Revenue: ₹{dueRevenue}</div>
      <div className="mb-2">Actual Revenue: ₹{actualRevenue}</div>
    </div>
  );
}
