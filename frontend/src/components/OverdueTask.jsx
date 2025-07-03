import React, { useEffect, useState } from "react";

export default function OverdueTask() {
  const [overdue, setOverdue] = useState([]);
  useEffect(() => {
    // Backend should filter for bills not packed 2 days before due date
    fetch("/api/bills/overdue/1") // Replace 1 with dynamic shopkeeper_id
      .then(res => res.json())
      .then(setOverdue);
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Overdue Tasks</h2>
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
