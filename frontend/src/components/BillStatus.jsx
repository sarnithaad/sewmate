import React, { useEffect, useState } from "react";
import StatusDropdown from "./Shared/StatusDropdown";

export default function BillStatus() {
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
      .catch(err => setError(err.message || "Error loading bills"));
  }, [shopkeeperId]);

  const handleStatusChange = async (billId, newStatus) => {
    const status_date = new Date().toISOString().slice(0, 10);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/bills/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bill_id: billId, status: newStatus, status_date }),
      });
      if (!res.ok) {
        let msg = "Failed to update status";
        try { msg = (await res.json()).error || msg; } catch {}
        throw new Error(msg);
      }
      setBills(bills =>
        bills.map(b => b.id === billId ? { ...b, status: newStatus, status_date } : b)
      );
    } catch (err) {
      setError(err.message || "Error updating status");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Bill Status</h2>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <table className="min-w-full border">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Bill No</th>
            <th>Status</th>
            <th>Status Date</th>
          </tr>
        </thead>
        <tbody>
          {bills.map(b => (
            <tr key={b.id}>
              <td>{b.customer_name}</td>
              <td>{b.bill_number}</td>
              <td>
                <StatusDropdown
                  value={b.status}
                  onChange={status => handleStatusChange(b.id, status)}
                />
              </td>
              <td>{b.status_date || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
