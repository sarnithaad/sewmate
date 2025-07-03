import React, { useEffect, useState } from "react";
import StatusDropdown from "./Shared/StatusDropdown";

export default function BillStatus() {
  const [bills, setBills] = useState([]);
  const [error, setError] = useState("");

  const shopkeeper = JSON.parse(localStorage.getItem("shopkeeper") || "{}");
  const shopkeeperId = shopkeeper.id;

  useEffect(() => {
    if (!shopkeeperId) {
      setError("Shopkeeper not found.");
      return;
    }
    fetch(`${process.env.REACT_APP_API_URL}/api/bills`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
      .then(async res => {
        if (!res.ok) {
          let msg = "Failed to fetch bills";
          try {
            msg = (await res.json()).error || msg;
          } catch {}
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
        body: JSON.stringify({ bill_id: billId, status: newStatus, status_date })
      });
      if (!res.ok) {
        let msg = "Failed to update status";
        try {
          msg = (await res.json()).error || msg;
        } catch {}
        throw new Error(msg);
      }

      // If delivered, remove bill
      if (newStatus === "Delivered") {
        setBills(prev => prev.filter(b => b.id !== billId));
      } else {
        setBills(prev =>
          prev.map(b =>
            b.id === billId ? { ...b, status: newStatus, status_date } : b
          )
        );
      }
    } catch (err) {
      setError(err.message || "Error updating status");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold text-indigo-700 mb-4">📋 Bill Status</h2>

      {error && (
        <div className="mb-4 text-red-600 bg-red-100 border border-red-300 p-2 rounded">
          {error}
        </div>
      )}

      <div className="overflow-x-auto bg-white rounded shadow-md">
        <table className="min-w-full text-sm text-left border-collapse">
          <thead className="bg-indigo-100 text-gray-700">
            <tr>
              <th className="px-4 py-2 border">Customer</th>
              <th className="px-4 py-2 border">Bill No</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Status Date</th>
            </tr>
          </thead>
          <tbody>
            {bills.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-500">
                  No active bills
                </td>
              </tr>
            ) : (
              bills.map(bill => (
                <tr key={bill.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2 border">{bill.customer_name}</td>
                  <td className="px-4 py-2 border">{bill.bill_number}</td>
                  <td className="px-4 py-2 border">
                    <StatusDropdown
                      value={bill.status}
                      onChange={status => handleStatusChange(bill.id, status)}
                    />
                  </td>
                  <td className="px-4 py-2 border">{bill.status_date || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
