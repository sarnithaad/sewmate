// src/components/NewBill.jsx
import React, { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import PrintableBill from "./PrintableBill";

const dressTypes = [
  { value: "Chudidhar", label: "Chudidhar" },
  { value: "Blouse", label: "Blouse" },
  { value: "Frock", label: "Frock" },
  { value: "Lehanga", label: "Lehanga" }
];

const measurementsList = {
  Chudidhar: [
    "full length", "shoulder", "front neck", "back neck", "upper chest", "middle chest", "hip", "seat",
    "sleeve length", "sleeve width", "upper arm", "lower arm", "pant length", "pant knee", "pant ankle"
  ],
  Blouse: [
    "dart length", "front neck", "back length", "back neck", "shoulder", "upper chest", "middle chest", "hip",
    "sleeve length", "sleeve width", "upper arm", "lower arm"
  ],
  Frock: [
    "skirt length", "dart length", "front neck", "back length", "back neck", "shoulder", "upper chest", "middle chest", "hip",
    "seat", "sleeve length", "sleeve width", "upper arm", "lower arm"
  ],
  Lehanga: [
    "skirt length", "dart length", "front neck", "back length", "back neck", "shoulder", "upper chest", "middle chest", "hip",
    "seat", "sleeve length", "sleeve width", "upper arm", "lower arm"
  ]
};

export default function NewBill() {
  const [bill, setBill] = useState({
    bill_number: 1,
    customer_name: "",
    mobile: "",
    dress_type: "Chudidhar",
    order_date: "",
    due_date: "",
    measurements: {},
    others: "",
    total_value: 0,
  });
  const [showPrint, setShowPrint] = useState(false);

  const printRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `SewMate_Bill_${bill.bill_number}`,
  });

  // Handle measurement and price changes
  const handleMeasurementChange = (name, field, value) => {
    setBill(b => {
      const updated = {
        ...b,
        measurements: {
          ...b.measurements,
          [name]: {
            ...b.measurements[name],
            [field]: value
          }
        }
      };
      // Recalculate total
      updated.total_value = Object.values(updated.measurements)
        .reduce((sum, m) => sum + (parseFloat(m.price) || 0), 0);
      return updated;
    });
  };

  // Handle form submission (could POST to backend here)
  const handleSubmit = e => {
    e.preventDefault();
    setShowPrint(true);
  };

  return (
    <div className="p-4">
      <form className="space-y-2" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Customer Name"
          className="border p-1 rounded"
          value={bill.customer_name}
          onChange={e => setBill(b => ({ ...b, customer_name: e.target.value }))}
          required
        />
        <input
          type="text"
          placeholder="Mobile"
          className="border p-1 rounded"
          value={bill.mobile}
          onChange={e => setBill(b => ({ ...b, mobile: e.target.value }))}
          required
        />
        <select
          value={bill.dress_type}
          onChange={e => setBill(b => ({ ...b, dress_type: e.target.value }))}
          className="border p-1 rounded"
        >
          {dressTypes.map(dt => (
            <option key={dt.value} value={dt.value}>{dt.label}</option>
          ))}
        </select>
        <input
          type="date"
          className="border p-1 rounded"
          value={bill.order_date}
          onChange={e => setBill(b => ({ ...b, order_date: e.target.value }))}
          required
        />
        <input
          type="date"
          className="border p-1 rounded"
          value={bill.due_date}
          onChange={e => setBill(b => ({ ...b, due_date: e.target.value }))}
          required
        />
        <div className="border p-2 rounded">
          <div className="font-semibold mb-1">Measurements & Price</div>
          {measurementsList[bill.dress_type].map(m => (
            <div key={m} className="flex gap-2 items-center mb-1">
              <label className="w-40">{m}</label>
              <input
                type="text"
                placeholder="Measurement"
                className="border p-1 rounded"
                value={bill.measurements[m]?.value || ""}
                onChange={e => handleMeasurementChange(m, "value", e.target.value)}
              />
              <input
                type="number"
                placeholder="Price"
                className="border p-1 rounded"
                value={bill.measurements[m]?.price || ""}
                onChange={e => handleMeasurementChange(m, "price", e.target.value)}
              />
            </div>
          ))}
        </div>
        <textarea
          placeholder="Others"
          className="border p-2 w-full rounded"
          value={bill.others}
          onChange={e => setBill(b => ({ ...b, others: e.target.value }))}
        />
        <div className="font-bold">Total: ₹{bill.total_value}</div>
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
          Save & Show Print Preview
        </button>
      </form>

      {showPrint && (
        <div className="mt-6">
          <button
            onClick={handlePrint}
            className="bg-blue-500 text-white px-4 py-2 rounded mb-2"
          >
            Print Bill
          </button>
          <div ref={printRef} className="bg-white shadow rounded p-4">
            <PrintableBill bill={bill} />
          </div>
        </div>
      )}
    </div>
  );
}
