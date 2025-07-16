import React, { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import PrintableBill from "./PrintableBill";
import { useAuth } from "../context/AuthContext";

const dressTypes = [
  { value: "Chudidhar", label: "Chudidhar" },
  { value: "Blouse", label: "Blouse" },
  { value: "Frock", label: "Frock" },
  { value: "Lehanga", label: "Lehanga" }
];

const measurementsList = {
  Chudidhar: ["Full Length", "Front neck", "Back Neck", "Shoulder", "Upper Chest", "Middle Chest", "Waist", "Seat", "Sleeve Length", "Sleeve Width", "Pant Length", "Knee", "Ankle"],
  Blouse: ["Front Neck", "Dart Length", "Back Neck", "Back Length", "Shoulder", "Upper Chest", "Middle Chest", "Waist", "Sleeve Length", "Sleeve Width"],
  Frock: ["Frock Length", "Half Length", "Front neck", "Back Neck", "Shoulder", "Upper Chest", "Middle Chest", "Waist", "Seat", "Sleeve Length", "Sleeve Width"],
  Lehanga: ["Skirt Length", "Dart Length", "Front Neck", "Back Length", "Back Neck", "Shoulder", "Upper Chest", "Middle Chest", "Waist", "Seat", "Sleeve Length", "Sleeve Width"]
};

const extrasOptionsMap = {
  Chudidhar: ["Rope", "Hangings", "Pocket", "Dupatta"],
  Blouse: ["Rope", "Hangings", "Saree", "False", "Edge", "Hand-loom Edge", "Pre-pleating"],
  Lehanga: ["Skirt", "Dupatta", "Belt", "Rope", "Hangings"]
};

const pantTypes = ["Patiala", "Crush Legging", "Ankle Length"];

export default function NewBill({ onBillSaved }) {
  const [bill, setBill] = useState({
    customer_name: "",
    mobile: "",
    dress_type: "Chudidhar",
    order_date: new Date().toISOString().split("T")[0],
    due_date: "",
    measurements: {},
    extras: [],
    total_value: 0
  });

  const [pantType, setPantType] = useState("");
  const [customExtras, setCustomExtras] = useState([]);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");
  const [showPrint, setShowPrint] = useState(false);
  const [designs, setDesigns] = useState([]);
  const [selectedDesignUrl, setSelectedDesignUrl] = useState("");
  const [designFetchError, setDesignFetchError] = useState("");
  const [generatedBillNumber, setGeneratedBillNumber] = useState(null);

  const { token, user } = useAuth();
  const printRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `SewMate_Bill_${generatedBillNumber || "New"}`
  });

  const resetForm = () => {
    setBill({
      customer_name: "",
      mobile: "",
      dress_type: "Chudidhar",
      order_date: new Date().toISOString().split("T")[0],
      due_date: "",
      measurements: {},
      extras: [],
      total_value: 0
    });
    setPantType("");
    setCustomExtras([]);
    setSelectedDesignUrl("");
    setGeneratedBillNumber(null);
    setShowPrint(false);
    setMsg("");
    setMsgType("");
  };

  useEffect(() => {
    if (!token || !user) {
      setDesignFetchError("Unauthorized: Please log in to view designs.");
      setDesigns([]);
      return;
    }

    fetch(`${process.env.REACT_APP_API_URL}/api/designs?dress_type=${bill.dress_type}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDesigns(data);
          setDesignFetchError("");
        } else {
          setDesigns([]);
          setDesignFetchError("Invalid designs data received.");
        }
      })
      .catch(err => {
        console.error("Design fetch error", err);
        setDesigns([]);
        setDesignFetchError("Error fetching designs.");
      });
  }, [token, user, bill.dress_type]);

  const handleChange = (field, value) => {
    setBill(prev => ({ ...prev, [field]: value }));
    if (field === "dress_type") {
      setPantType("");
      setCustomExtras([]);
    }
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

  const calculateTotalValue = (extras) => {
    return extras.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
  };

  const handleAddExtra = () => {
    setBill(prev => {
      const newExtras = [...prev.extras, { name: "", price: 0 }];
      const newTotal = calculateTotalValue(newExtras);
      return {
        ...prev,
        extras: newExtras,
        total_value: newTotal
      };
    });
  };

  const handleExtraChange = (index, field, value) => {
    setBill(prev => {
      const updatedExtras = [...prev.extras];
      updatedExtras[index][field] = field === "price" ? parseFloat(value) || 0 : value;
      const newTotal = calculateTotalValue(updatedExtras);
      return {
        ...prev,
        extras: updatedExtras,
        total_value: newTotal
      };
    });
  };

  const handleSave = async e => {
    e.preventDefault();
    setMsg("");
    setMsgType("");
    setShowPrint(false);

    if (!user || !token) {
      setMsg("Shopkeeper not authenticated. Please log in.");
      setMsgType("error");
      return;
    }

    const finalExtras = [
      ...bill.extras,
      ...customExtras.map(name => ({ name, price: 0 })),
      ...(pantType ? [{ name: `Pant Type: ${pantType}`, price: 0 }] : [])
    ];

    const total_value = calculateTotalValue(finalExtras);

    const payload = {
      ...bill,
      extras: finalExtras,
      total_value,
      shopkeeper_id: user.id,
      design_url: selectedDesignUrl
    };

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/bills`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(data.error || "Failed to save bill");
        setMsgType("error");
      } else {
        setMsg("✅ Bill saved successfully!");
        setMsgType("success");
        setGeneratedBillNumber(data.bill_number);
        setShowPrint(true);
        onBillSaved && onBillSaved();
      }
    } catch (err) {
      console.error(err);
      setMsg("Network error.");
      setMsgType("error");
    }
  };

  const selectedMeasurements = measurementsList[bill.dress_type] || [];
  const dressExtras = extrasOptionsMap[bill.dress_type] || [];

  return (
    <div className="p-6 bg-gradient-to-br from-[#FDF0F3] to-[#F2E5E8] min-h-screen font-inter">
      <h2 className="text-3xl font-bold mb-6 text-center text-[#754F4F]">🧾 New Bill Entry</h2>
      <form onSubmit={handleSave} className="bg-white p-6 rounded-xl shadow-xl space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Customer Name" required value={bill.customer_name} onChange={e => handleChange("customer_name", e.target.value)} className="input" />
          <input type="tel" placeholder="Mobile" required pattern="[0-9]{10}" value={bill.mobile} onChange={e => handleChange("mobile", e.target.value)} className="input" />
          <select value={bill.dress_type} onChange={e => handleChange("dress_type", e.target.value)} className="input" required>
            {dressTypes.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
          <input type="date" required value={bill.order_date} onChange={e => handleChange("order_date", e.target.value)} className="input" />
          <input type="date" required value={bill.due_date} onChange={e => handleChange("due_date", e.target.value)} className="input" />
        </div>

        {/* Measurements */}
        <div>
          <h3 className="font-semibold text-xl mb-2">📏 Measurements</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {selectedMeasurements.map(m => (
              <input key={m} type="text" placeholder={m} value={bill.measurements[m] || ""} onChange={e => handleMeasurementInput(m, e.target.value)} className="input" />
            ))}
          </div>
        </div>

        {/* Pant Type & Dynamic Extras */}
        {bill.dress_type === "Chudidhar" && (
          <div>
            <label className="font-semibold block mt-4 mb-1">👖 Pant Type</label>
            <select value={pantType} onChange={e => setPantType(e.target.value)} className="input">
              <option value="">Select Pant Type</option>
              {pantTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
        )}

        {dressExtras.length > 0 && (
          <div>
            <label className="font-semibold block mt-4 mb-2">✨ Select Applicable Extras</label>
            <div className="flex flex-wrap gap-4">
              {dressExtras.map(option => (
                <label key={option} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={customExtras.includes(option)}
                    onChange={e =>
                      setCustomExtras(prev =>
                        e.target.checked ? [...prev, option] : prev.filter(item => item !== option)
                      )
                    }
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Paid Extras */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-xl">➕ Paid Addons</h3>
            <button type="button" onClick={handleAddExtra} className="btn-add">+ Add Item</button>
          </div>
          {bill.extras.map((extra, index) => (
            <div key={index} className="flex gap-4 mb-2">
              <input type="text" placeholder="Item Name" value={extra.name} onChange={e => handleExtraChange(index, "name", e.target.value)} className="input" />
              <input type="number" placeholder="₹ Price" value={extra.price} onChange={e => handleExtraChange(index, "price", e.target.value)} className="input w-32" />
            </div>
          ))}
        </div>
            {/* Design Selector */}
                <div>
                    <h3 className="font-bold text-xl text-gray-800 mb-3 flex items-center">
                        <span className="mr-2 text-2xl">🎨</span> Choose Design (optional) - <span className="text-[#754F4F] ml-1">{bill.dress_type}</span>
                    </h3>
                    {designFetchError && (
                        <div className="bg-red-100 border border-red-300 text-red-700 p-3 rounded-lg mb-4 shadow-md animate-slide-down">
                            ❌ {designFetchError}
                        </div>
                    )}
                    <div className="flex gap-4 flex-wrap justify-center">
                        {designs.length === 0 && !designFetchError ? (
                            <div className="text-gray-500 italic text-center py-4">
                                <p>No uploaded designs available for {bill.dress_type}.</p>
                                <img
                                    src="https://placehold.co/100x100/FDF0F3/754F4F?text=No+Design"
                                    alt="No Designs Icon"
                                    className="mx-auto mt-4 rounded-full shadow-sm"
                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100/cccccc/333333?text=Error'; }}
                                />
                            </div>
                        ) : (
                            designs.map(design => (
                                <div
                                    key={design.id}
                                    className={relative border-2 rounded-lg cursor-pointer p-1 transition-all duration-300 transform hover:scale-105 hover:shadow-lg
                                        ${selectedDesignUrl === ${process.env.REACT_APP_API_URL}${design.image_url}
                                            ? "ring-4 ring-[#754F4F] border-[#754F4F] shadow-xl"
                                            : "border-gray-300 shadow-md"
                                        }}
                                    onClick={() => setSelectedDesignUrl(${process.env.REACT_APP_API_URL}${design.image_url})}
                                >
                                    <img
                                        src={${process.env.REACT_APP_API_URL}${design.image_url}}
                                        alt={design.name}
                                        className="h-28 w-28 object-cover rounded-md"
                                        onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/112x112/cccccc/333333?text=No+Image"; }} // Fallback
                                    />
                                    <div className="text-center text-xs mt-1 font-medium">{design.name} ({design.part})</div>
                                    {selectedDesignUrl === ${process.env.REACT_APP_API_URL}${design.image_url} && (
                                        <div className="absolute top-1 right-1 bg-[#754F4F] text-white rounded-full p-1 text-xs">
                                            ✔
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
        {/* Total + Actions */}
        <div className="text-2xl font-bold text-[#754F4F] text-center">Total: ₹{bill.total_value}</div>
        <div className="flex gap-4 justify-center">
          <button type="submit" className="btn-save">💾 Save & Preview</button>
          {showPrint && (
            <>
              <button onClick={handlePrint} type="button" className="btn-print">🖨️ Print</button>
              <button onClick={resetForm} type="button" className="btn-new">✨ New</button>
            </>
          )}
        </div>
        {msg && <div className={`text-center mt-4 font-medium ${msgType === "success" ? "text-green-700" : "text-red-700"}`}>{msg}</div>}
      </form>

      {showPrint && generatedBillNumber && (
        <div ref={printRef} className="mt-8 bg-white p-6 rounded-xl shadow-lg">
          <PrintableBill bill={{ ...bill, bill_number: generatedBillNumber, design_url: selectedDesignUrl }} />
        </div>
      )}

      {/* Styling */}
      <style jsx>{`
        .input {
          border: 1px solid #ccc;
          padding: 0.75rem;
          border-radius: 0.5rem;
          width: 100%;
        }
        .btn-add, .btn-save, .btn-print, .btn-new {
          padding: 0.75rem 1.25rem;
          border-radius: 9999px;
          font-weight: 600;
        }
        .btn-add { background-color: #ccc; }
        .btn-save { background-color: #D1A6AD; color: white; }
        .btn-print { background-color: #754F4F; color: white; }
        .btn-new { background-color: #F2E5E8; color: #754F4F; }
      `}</style>
    </div>
  );
}
