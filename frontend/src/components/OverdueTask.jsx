import React, { useEffect, useState } from "react";

export default function OverdueTask() {
  const [overdue, setOverdue] = useState([]);
  const [error, setError] = useState("");

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
          try {
            msg = (await res.json()).error || msg;
          } catch {}
          throw new Error(msg);
        }
        return res.json();
      })
      .then(setOverdue)
      .catch(err => setError(err.message || "Error loading overdue tasks"));
  }, [shopkeeperId]);

  const getStatusStyle = status => {
    const base = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "Measured":
        return `${base} bg-yellow-100 text-yellow-800`;
      case "Cutting":
        return `${base} bg-blue-100 text-blue-800`;
      case "Stitched":
        return `${base} bg-green-100 text-green-800`;
      case "Delivered":
        return `${base} bg-gray-200 text-gray-600`;
      default:
        return `${base} bg-red-100 text-red-700`;
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold text-rose-700 mb-4">📌 Overdue Tasks</h2>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded border border-red-300 mb-4">
          {error}
        </div>
      )}

      <div className="overflow-x-auto bg-white shadow rounded">
        <table className="min-w-full text-sm text-left border-collapse">
          <thead className="bg-rose-100 text-gray-800">
            <tr>
              <th className="px-4 py-2 border">Customer</th>
              <th className="px-4 py-2 border">Bill No</th>
              <th className="px-4 py-2 border">Current Status</th>
              <th className="px-4 py-2 border">Due Date</th>
            </tr>
          </thead>
          <tbody>
            {overdue.length === 0 && !error ? (
              <tr>
                <td colSpan="4" className="text-center py-6 text-gray-500">
                  ✅ No overdue tasks found!
                </td>
              </tr>
            ) : (
              overdue.map(bill => (
                <tr key={bill.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2 border">{bill.customer_name}</td>
                  <td className="px-4 py-2 border">{bill.bill_number}</td>
                  <td className="px-4 py-2 border">
                    <span className={getStatusStyle(bill.status)}>{bill.status}</span>
                  </td>
                  <td className="px-4 py-2 border">{bill.due_date}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
