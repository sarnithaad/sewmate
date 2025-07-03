import React, { useEffect, useState } from "react";

export default function OverdueTask() {
  const [overdue, setOverdue] = useState([]);
  const [error, setError] = useState("");

  // Get shopkeeper ID from localStorage
  const shopkeeper = JSON.parse(localStorage.getItem("shopkeeper") || "{}");
  const shopkeeperId = shopkeeper.id;

  useEffect(() => {
    if (!shopkeeperId) {
      setError("Shopkeeper not found.");
      return;
    }
    fetch(`${process.env.REACT_APP_API_URL}/api/bills/overdue/${shopkeeperId}`)
      .then(async res => {
        if (!res.ok) {
          let msg = "Failed to fetch overdue tasks";
          try { msg = (await res.json()).error || msg; } catch {}
          throw new Error(msg);
        }
        return res.json();
      })
      .then(setOverdue)
      .catch(err => setError(err.message || "Error loading overdue tasks"));
  }, [shopkeeperId]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Overdue Tasks</h2>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <table className="min-w-full border">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Bill No</th>
            <th>Status</th>
            <th>Due Date</th>
          </tr>
        </thead>
        <tbody>
          {overdue.length === 0 && !error && (
            <tr>
              <td colSpan={4} className="text-center text-gray-500 py-4">
                No overdue tasks found.
              </td>
            </tr>
          )}
          {overdue.map(bill => (
            <tr key={bill.id}>
              <td>{bill.customer_name}</td>
              <td>{bill.bill_number}</td>
              <td>{bill.status}</td>
              <td>{bill.due_date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
