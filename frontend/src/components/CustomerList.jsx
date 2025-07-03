import React, { useEffect, useState } from "react";

export default function CustomerList() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/bills")
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch bills");
        return res.json();
      })
      .then(data => {
        setBills(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || "Error loading customers");
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Customers</h2>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && (
        <table className="min-w-full border">
          <thead>
            <tr>
              <th>Bill No</th>
              <th>Name</th>
              <th>Mobile</th>
              <th>Order Date</th>
              <th>Due Date</th>
              <th>Bill Value</th>
            </tr>
          </thead>
          <tbody>
            {bills.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">
                  No customers found.
                </td>
              </tr>
            )}
            {bills.map(bill => (
              <tr key={bill.bill_number}>
                <td>{bill.bill_number}</td>
                <td>{bill.customer_name}</td>
                <td>{bill.mobile}</td>
                <td>{bill.order_date}</td>
                <td>{bill.due_date}</td>
                <td>₹{bill.total_value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
