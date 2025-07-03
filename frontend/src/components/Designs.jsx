import React, { useState } from "react";
import DesignUpload from "./DesignUpload";

const designTypes = [
  { label: "Chudidhar", value: "Chudidhar" },
  { label: "Blouse", value: "Blouse" },
  { label: "Frock", value: "Frock" }
];

const parts = ["front", "back", "sleeve"];

export default function Designs() {
  const [dressType, setDressType] = useState(designTypes[0].value);
  const [part, setPart] = useState(parts[0]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-indigo-700 mb-6">🎨 Designs</h2>

      {/* Dress Type Selection */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Select Dress Type</h3>
        <div className="flex flex-wrap gap-3">
          {designTypes.map(dt => (
            <button
              key={dt.value}
              onClick={() => setDressType(dt.value)}
              type="button"
              className={`px-4 py-2 rounded shadow-sm border transition ${
                dressType === dt.value
                  ? "bg-indigo-600 text-white border-indigo-700"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {dt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Part Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Select Part</h3>
        <div className="flex flex-wrap gap-3">
          {parts.map(p => (
            <button
              key={p}
              onClick={() => setPart(p)}
              type="button"
              className={`px-4 py-2 rounded shadow-sm border transition ${
                part === p
                  ? "bg-blue-600 text-white border-blue-700"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Upload Component */}
      <DesignUpload dressType={dressType} part={part} />
    </div>
  );
}
