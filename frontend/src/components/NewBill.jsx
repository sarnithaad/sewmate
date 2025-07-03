import React, { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import PrintableBill from "./PrintableBill";

const dressTypes = [
  { value: "Chudidhar", label: "Chudidhar" },
  { value: "Blouse", label: "Blouse" },
  { value: "Frock", label: "Frock" },
  { value: "Lehanga", label: "Lehanga" }
];

// FULL measurements preserved from old code
const measurementsList = {
  Chudidhar: ["Chest", "Waist", "Length", "Shoulder", "Sleeve", "Hip"],
  Blouse: ["Chest", "Waist", "Length", "Shoulder", "Sleeve", "Front Neck", "Back Neck"],
  Frock: ["Length", "Shoulder", "Waist", "Chest", "Hip"],
  Lehanga: ["Waist", "Hip", "Length", "Blouse Chest", "Blouse Waist"]
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
    extras: [],
    total_value: 0
  });

  const [msg, setMsg] = useState("");
  const [showPrint, setShowPrint] = useState(false);
  const printRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `SewMate_Bill_${bill.bill_number}`
  });

  const handleChange = (field, value) => {
    setBill(prev => ({ ...prev, [field]: value }));
  };

  const handleMeasurementInput = (name, value) => {
    setBill(prev => ({
      ...prev,
      measurements: {
        ...prev.measurements,
        [name]: value
      }
    }));
  };

  const handleAddExtra = () => {
    setBill(prev => ({
      ...prev,
      extras: [...prev.extras, { name: "", price: 0 }]
    }));
  };

  const handleExtraChange = (index, field, value) => {
    const updatedExtras = [...bill.extras];
    updatedExtras[index][field] = field === "price" ? parseFloat(value) || 0 : value;
    const total = updatedExtras.reduce((sum, item) => sum + (item.price || 0), 0);
    setBill(prev => ({
      ...prev,
      extras: updatedExtras,
      total_value: total
    }));
  };

  const handleSave = async e => {
    e.preventDefault();
    setMsg("");
    const shopkeeper = JSON.parse(localStorage.getItem("shopkeeper") || "{}");
    const shopkeeper_id = shopkeeper.id;
    if (!shopkeeper_id) return setMsg("Shopkeeper not found.");
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/bills`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...bill, shopkeeper_id })
      });
      const data = await res.json();
      if (!res.ok) return setMsg(data.error || "Failed to save bill");
      setMsg("✅ Bill saved successfully!");
      setShowPrint(true);
    } catch {
      setMsg("Network error. Please try again.");
    }
  };

  const selectedMeasurements = measurementsList[bill.dress_type] || [];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold text-indigo-700 mb-4">🧾 New Bill Entry</h2>

      <form className="space-y-4 bg-white p-6 rounded shadow-md" onSubmit={handleSave}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Customer Name"
            className="border p-2 rounded w-full"
            value={bill.customer_name}
            onChange={e => handleChange("customer_name", e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Mobile"
            className="border p-2 rounded w-full"
            value={bill.mobile}
            onChange={e => handleChange("mobile", e.target.value)}
            required
          />
          <select
            value={bill.dress_type}
            onChange={e => handleChange("dress_type", e.target.value)}
            className="border p-2 rounded w-full"
          >
            {dressTypes.map(d => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
          <input
            type="date"
            className="border p-2 rounded w-full"
            placeholder="Booking Date"
            value={bill.order_date}
            onChange={e => handleChange("order_date", e.target.value)}
            required
          />
          <input
            type="date"
            className="border p-2 rounded w-full"
            placeholder="Due Date"
            value={bill.due_date}
            onChange={e => handleChange("due_date", e.target.value)}
            required
          />
        </div>

        {/* Measurements */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">📏 Measurements (No price)</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {selectedMeasurements.map(m => (
              <input
                key={m}
                type="text"
                placeholder={m}
                className="border p-2 rounded"
                value={bill.measurements[m] || ""}
                onChange={e => handleMeasurementInput(m, e.target.value)}
              />
            ))}
          </div>
        </div>

        {/* Extras */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-gray-700">➕ Additional Items (with price)</h3>
            <button
              type="button"
              onClick={handleAddExtra}
              className="text-sm text-blue-600 hover:underline"
            >
              + Add Item
            </button>
          </div>
          {bill.extras.map((extra, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Item"
                className="border p-2 rounded w-full"
                value={extra.name}
                onChange={e => handleExtraChange(index, "name", e.target.value)}
              />
              <input
                type="number"
                placeholder="₹"
                className="border p-2 rounded w-28"
                value={extra.price}
                onChange={e => handleExtraChange(index, "price", e.target.value)}
              />
            </div>
          ))}
        </div>

        <div className="text-lg font-semibold mt-4">
          Total: ₹{bill.total_value.toLocaleString("en-IN")}
        </div>

        <div className="flex flex-wrap gap-4 mt-4">
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            💾 Save & Show Print Preview
          </button>

          {showPrint && (
            <button
              type="button"
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              🖨️ Print Bill
            </button>
          )}
        </div>

        {msg && <div className="mt-2 text-blue-600">{msg}</div>}
      </form>

      {showPrint && (
        <div className="mt-8">
          <div ref={printRef} className="bg-white p-6 rounded shadow">
            <PrintableBill bill={bill} />
          </div>
        </div>
      )}
    </div>
  );
}
