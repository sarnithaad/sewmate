import React, { useEffect, useState } from "react";
import StatusDropdown from "./Shared/StatusDropdown";

export default function BillStatus() {
  const [bills, setBills] = useState([]);
  useEffect(() => {
    fetch("/api/bills/1") // Replace 1 with dynamic shopkeeper_id
      .then(res => res.json())
      .then(setBills);
  }, []);

  const handleStatusChange = async (billId, newStatus) => {
    const status_date = new Date().toISOString().slice(0, 10);
    await fetch("/api/bills/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bill_id: billId, status: newStatus, status_date }),
    });
    setBills(bills.map(b => b.id === billId ? { ...b, status: newStatus } : b));
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Bill Status</h2>
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
