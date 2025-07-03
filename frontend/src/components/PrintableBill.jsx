// src/components/PrintableBill.jsx
import React, { forwardRef } from "react";

const PrintableBill = forwardRef(({ bill }, ref) => (
  <div ref={ref} className="p-6 min-w-[350px] max-w-[600px] mx-auto font-sans">
    <h2 className="text-2xl font-bold mb-2 text-center">SewMate Bill</h2>
    <hr className="mb-2" />
    <div><strong>Bill No:</strong> {bill.bill_number}</div>
    <div><strong>Customer:</strong> {bill.customer_name}</div>
    <div><strong>Mobile:</strong> {bill.mobile}</div>
    <div><strong>Dress Type:</strong> {bill.dress_type}</div>
    <div><strong>Order Date:</strong> {bill.order_date}</div>
    <div><strong>Due Date:</strong> {bill.due_date}</div>
    <div className="mt-2"><strong>Measurements & Price:</strong></div>
    <table className="w-full border mt-1 mb-2 text-sm">
      <thead>
        <tr>
          <th className="border px-2">Measurement</th>
          <th className="border px-2">Value</th>
          <th className="border px-2">Price</th>
        </tr>
      </thead>
      <tbody>
        {bill.measurements && Object.entries(bill.measurements).map(([key, val]) => (
          <tr key={key}>
            <td className="border px-2">{key}</td>
            <td className="border px-2">{val.value}</td>
            <td className="border px-2">{val.price}</td>
          </tr>
        ))}
      </tbody>
    </table>
    <div><strong>Others:</strong> {bill.others || "-"}</div>
    <div className="mt-2 text-lg font-bold">Total: ₹{bill.total_value}</div>
  </div>
));

export default PrintableBill;
