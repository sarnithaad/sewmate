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
  Chudidhar: [/* ... */],
  Blouse: [/* ... */],
  Frock: [/* ... */],
  Lehanga: [/* ... */]
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
  const [msg, setMsg] = useState("");
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
      updated.total_value = Object.values(updated.measurements)
        .reduce((sum, m) => sum + (parseFloat(m.price) || 0), 0);
      return updated;
    });
  };

  // Handle form submission: POST to backend and show print preview
  const handleSubmit = async e => {
    e.preventDefault();
    setMsg("");
    // Get shopkeeper_id from localStorage
    const shopkeeper = JSON.parse(localStorage.getItem("shopkeeper") || "{}");
    const shopkeeper_id = shopkeeper.id;
    if (!shopkeeper_id) {
      setMsg("Shopkeeper not found.");
      return;
    }
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/bills`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...bill, shopkeeper_id }),
      });
      let data;
      try {
        data = await res.json();
      } catch {
        setMsg("Server error: invalid response");
        return;
      }
      if (!res.ok) {
        setMsg(data.error || "Failed to save bill");
        return;
      }
      setMsg("Bill saved successfully!");
      setShowPrint(true);
      // Optionally, set bill_number from backend response if it's generated there
      // setBill(b => ({ ...b, bill_number: data.bill_number }));
    } catch (err) {
      setMsg("Network error. Please try again.");
    }
  };

  return (
    <div className="p-4">
      <form className="space-y-2" onSubmit={handleSubmit}>
        {/* ... all your form fields ... */}
        <input
          type="text"
          placeholder="Customer Name"
          className="border p-1 rounded"
          value={bill.customer_name}
          onChange={e => setBill(b => ({ ...b, customer_name: e.target.value }))}
          required
        />
        {/* ... other fields ... */}
        <div className="font-bold">Total: ₹{bill.total_value}</div>
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
          Save & Show Print Preview
        </button>
        {msg && <div className="mt-2 text-blue-600">{msg}</div>}
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
