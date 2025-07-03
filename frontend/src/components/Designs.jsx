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
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Designs</h2>
      <div className="flex gap-3 mb-4">
        {designTypes.map(dt => (
          <button
            key={dt.value}
            className={`px-4 py-2 rounded ${dressType === dt.value ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            onClick={() => setDressType(dt.value)}
            type="button"
          >
            {dt.label}
          </button>
        ))}
      </div>
      <div className="flex gap-3 mb-4">
        {parts.map(p => (
          <button
            key={p}
            className={`px-4 py-2 rounded ${part === p ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            onClick={() => setPart(p)}
            type="button"
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>
      <DesignUpload dressType={dressType} part={part} />
    </div>
  );
}
