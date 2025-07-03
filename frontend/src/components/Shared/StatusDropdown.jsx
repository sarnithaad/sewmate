import React from "react";

const options = [
  "Booked", "Cut", "Stitched", "Packed", "Delivered"
];

export default function StatusDropdown({ value, onChange }) {
  return (
    <select
      className="border p-1 rounded"
      value={value}
      onChange={e => onChange(e.target.value)}
    >
      {options.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  );
}
